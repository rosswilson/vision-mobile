angular.module('vision')

.controller('PlaybackCtrl', function ($scope, SetTitle, $routeParams, ProgrammeService,
  PlayerStatsService, WatchLaterService, StatsLogging) {

  var self = this;

  SetTitle("Playback");

  $scope.programme_id = $routeParams['programme_id'];
  $scope.start_at = $routeParams['start_at'] ? $routeParams['start_at'] : 0;

  $scope.last_segment_start = $scope.start_at;
  $scope.last_segment_end = $scope.start_at;

  // Make sure that the player is stopped on controller exit
  $scope.$on('$destroy', function() {
    document.getElementById('video-player').stop();
    document.getElementById('video_wrapper').innerHtml = '';
  });

  var success = function(programme) {
    $scope.playback_error = false;
    $scope.programme = programme;

    if(programme.watch_live || programme.watch_catchup) {
      PlayerStatsService.new_instance(programme.programme_id, programme.playback_url);

      // Set the video player poster image if not resuming (since we'll immediately start playing)
      var player = document.getElementById('video-player');
      player.setAttribute("poster", ProgrammeService.get_poster_url($scope.programme, 720, 405));

      player = new MediaElementPlayer('#video-player', {
        type: ['video/mp4'],
        iPhoneUseNativeControls: true,
        success: function (mediaElement, domObject) {
          var resume_playback = function() {
            mediaElement.setCurrentTime($scope.start_at);
            mediaElement.play();
            mediaElement.removeEventListener("canplay", resume_playback);
          };

          // If resuming, once player has media metadata, we can shift the playhead position
          if($scope.start_at) {
            mediaElement.addEventListener("canplay", resume_playback);
          }

          var calculate_segment = function() {
            var currentSeconds = Math.floor(mediaElement.currentTime);

            // Proceed if not already updated segment and it's been 3 seconds since we last did
            if(currentSeconds != $scope.last_segment_end && currentSeconds != 0 && currentSeconds % 3 == 0) {

              // Check if skipped more than *5* seconds (not 3) incase timings are slightly inaccurate
              if(currentSeconds < $scope.last_segment_end || currentSeconds > $scope.last_segment_end + 5) {
                $scope.last_segment_start = currentSeconds;
                // console.log("Logging skipped segment " + $scope.last_segment_start + ":" + currentSeconds);
              }

              PlayerStatsService.log_segment($scope.last_segment_start, $scope.last_segment_end);
              $scope.last_segment_end = currentSeconds;
            }
          }

          mediaElement.addEventListener('timeupdate', function() {
            calculate_segment();
          });

          mediaElement.addEventListener('seeked', function() {
            calculate_segment();
          });

          mediaElement.setSrc(programme.playback_url);
          // mediaElement.load();
        }
      });
    }

    StatsLogging.log("MOBILE_PLAYBACK", {
      programme_id: $scope.programme.programme_id,
      file_id: $scope.programme.playback_url,
      is_live: $scope.programme.watch_live,
      is_vod: $scope.programme.watch_catchup,
      is_available_soon: $scope.programme.available_soon,
      is_waiting_recording: $scope.programme.waiting_to_be_recorded,
      is_not_available: $scope.programme.not_available,
      start_at: $scope.start_at
    });
  };

  var error = function(error) {
    $scope.playback_error = true;
    console.log(error);
  };

  var promise = ProgrammeService.get($scope.programme_id).then(success, error);

  $scope.watch_later = function() {
    var player = document.getElementById('video-player');
    var current_time = 0;

    if(player) {
      var current_time = Math.floor(player.currentTime);
    }

    WatchLaterService.store($scope.programme_id, current_time, $scope.programme.watch_live);
  };
})

.service('ProgrammeService', function ($http, $q, QueryStringBuilder, VODBalanceService) {
  var _url = 'http://10.42.32.184/search2.php';

  return {
    get: function(programme_id) {
      var deferred = $q.defer();
      var params = {
        q: programme_id,
        qf: 'programme_id',
        start: 0,
        rows: 10,
        url: '/future/select',
        wt: 'json',
        send_filters: false,
        sort: 'score+desc'
      }

      // Fire the SOLR search query and store the promise
      var url = _url + '?' + QueryStringBuilder(params);
      var search_promise = $http.get(url, { cache: false });

      // Fire the VOD load balance query and store the promise
      var lb_promise = VODBalanceService.get();

      // Once both promises have returned we process the data and return the main promise
      $q.all([search_promise, lb_promise]).then(function(results) {
        var programme = results[0].data.response.docs[0];
        var vod_server = results[1].ip || "148.88.32.70";

        console.log("Using VOD server:", vod_server);

        if(programme) {

          // Set the playback URL either to the VOD file or live stream address
          if(programme.watch_catchup) {
            programme['playback_url'] = 'http://' + vod_server + '/' + programme.programme_id + '.mp4';
          } else if(programme.watch_live) {
            programme['playback_url'] = 'http://10.42.67.123:1935/live/mp4:' + programme.wowza_code + '/playlist.m3u8';
          }

          deferred.resolve(programme);
        } else {
          deferred.reject("Unknown programme ID");
        }

      });

      return deferred.promise;
    },
    get_poster_url: function(programme, width, height) {
      return "http://148.88.32.64/cache/" + width + "x" + height + "/programmes" + programme.image;
    }
  }
})

.service("PlayerStatsService", function(AuthService, $http, StatsLogging) {
  var _heartbeat_id = null;

  return {
    new_instance: function(programme_id, file_url) {
      _heartbeat_id = CryptoJS.SHA1("mobile" + Math.random() + programme_id).toString();
      console.log("Logging player instance, heartbeat ID: %s", _heartbeat_id);

      $http.get("http://10.42.32.75:9110/capture/player_instance", {
        params: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          programme_id: programme_id,
          file_id: file_url
        }
      });
    },
    log_segment: function(start, end) {
      $http.get("http://10.42.32.75:9110/capture/heartbeat", {
        params: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          start: start,
          end: end
        }
      });
    }
  }
})

.service("VODBalanceService", function($q, $http) {
  var _url = 'http://10.42.32.199:2000/balance/vod';

  return {
    get: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data[0]);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing VOD load balancing server");
      };

      $http.get(_url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
