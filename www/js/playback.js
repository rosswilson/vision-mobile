angular.module('vision')

.controller('PlaybackCtrl', function ($scope, SetTitle, $routeParams, ProgrammeService, PlayerStatsService) {
  SetTitle("Playback");

  // Programme ID to retrieve programme name, synopsis ect
  $scope.programme_id = $routeParams['programme_id'];

  // Live channel id e.g. bbcone.stream
  $scope.live_channel = $routeParams['live_channel'];

  // Seconds into the VOD to start playhead
  $scope.start_at = $routeParams['start_at'] ? $routeParams['start_at'] : 0;

  $scope.last_segment_start = $scope.start_at;
  $scope.last_segment_end = $scope.start_at;

  var success = function(data) {
    $scope.programme = data;

    // If a live channel was passed, use it's stream URL, else use VOD url
    if ($scope.live_channel) {
      var video_url = ProgrammeService.get_live_url($scope.live_channel);
    } else {
      var video_url = ProgrammeService.get_vod_url($scope.programme);
    }

    PlayerStatsService.new_instance($scope.programme_id, video_url);

    // Set the video player poster image if not resuming (since we'll immediately start playing)
    if($scope.start_at == 0) {
      var player = document.getElementById('video-player');
      player.setAttribute("poster", ProgrammeService.get_poster_url($scope.programme, 720, 405));
    }

    var player = new MediaElementPlayer('#video-player', {
      type: ['video/mp4'],
      success: function (mediaElement, domObject) {
        mediaElement.setSrc(video_url);
        mediaElement.load();

        // If resuming, once player has media metadata, we can shift the playhead position
        if($scope.start_at != 0) {
          mediaElement.addEventListener("canplay", function() {
            if($scope.start_at) {
              mediaElement.setCurrentTime($scope.start_at);
              $scope.start_at = null;
            }
            mediaElement.play();
          });
        }

        mediaElement.addEventListener('timeupdate', function() {
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
        });
      }
    });

  };

  var error = function(error) {
    console.log(error);
  };

  var promise = ProgrammeService.get($scope.programme_id).then(success, error);
})

.service('ProgrammeService', function ($http, $q, QueryStringBuilder) {
  var _url = 'http://vision.lancs.ac.uk:9110/modules/videometa/get_video_meta';

  return {
    get: function(programme_id) {
      var deferred = $q.defer();
      var params = {
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5',
        programme_id: programme_id
      }

      var success = function (data, status, headers, config) {
        if(data['num_res']) {
          var programme = data['data'][0];
          programme['vod_url'] = 'http://148.88.32.70/' + programme_id + '.mp4';
          deferred.resolve(programme);
        }
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: true }).success(success).error(failure);

      return deferred.promise;
    },
    get_live_url: function(channel) {
      return "http://10.42.67.123:1935/live/mp4:" + channel + "/playlist.m3u8";
    },
    get_vod_url: function(programme) {
      return programme.vod_url;
    },
    get_poster_url: function(programme, width, height) {
      return "http://148.88.32.64/cache/" + width + "x" + height + "/programmes" + programme.image;
    }
  }
})

.service("PlayerStatsService", function(AuthService) {
  var _heartbeat_id = null;

  return {
    new_instance: function(programme_id, file_url) {
      _heartbeat_id = CryptoJS.SHA1("mobile" + Math.random() + programme_id).toString();
      console.log("Logging player instance, heartbeat ID: %s", _heartbeat_id);

      $.ajax({
        url: "http://10.42.32.75:9110/capture/player_instance",
        type: "get",
        data: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          programme_id: programme_id,
          file_id: file_url
        }
      });

      // Log a Vision Mobile specific playback log
      $.ajax({
        url: "http://10.42.32.75:9110/capture/log",
        type: "get",
        data: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          log_type: "MOBILE_PLAYBACK",
          user_id: AuthService.user_id(),
          attributes: JSON.stringify({
            programme_id: programme_id,
            file_id: file_url
          })
        }
      });
    },
    log_segment: function(start, end) {
      $.ajax({
        url: "http://10.42.32.75:9110/capture/heartbeat",
        type: "get",
        data: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          start: start,
          end: end
        }
      });
    }
  }
});
