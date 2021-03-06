angular.module('vision')

.controller('PlaybackCtrl', function ($scope, SetTitle, $routeParams, ProgrammeService,
  StatsService, WatchLaterService, StatsService, ImageService, WebSocketService, $rootScope,
  EnrichmentService) {

  var self = this;

  $scope.enrichment_nodes = [];

  SetTitle("Playback");

  $scope.programme_id = $routeParams['programme_id'];

  // Make sure that the player is stopped on controller exit
  $scope.$on('$destroy', function() {
    document.getElementById('video-player').stop();
  });

  var success = function(programme) {
    $scope.playback_error = false;
    $scope.programme = programme;

    $scope.start_at = programme.last_known_position || 0;

    $scope.last_segment_start = $scope.start_at;
    $scope.last_segment_end = $scope.start_at;

    if(programme.watch_live || programme.watch_catchup) {
      StatsService.player_instance(programme.programme_id, programme.playback_url);

      // Set the video player poster image
      // TODO: Make this a directive
      var player = $scope.player = document.getElementById('video-player');

      $scope.poster_image = ImageService.get_url($scope.programme.image, 720, 405);
      player.setAttribute("poster", $scope.poster_image);

      player = new MediaElementPlayer('#video-player', {
        type: ['video/mp4'],
        iPhoneUseNativeControls: true,
        success: function (mediaElement, domObject) {
          mediaElement.setSrc(programme.playback_url);

          var resume_playback = function() {
            mediaElement.removeEventListener("canplay", resume_playback);
            mediaElement.setCurrentTime($scope.start_at);
            // mediaElement.play();
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
              }

              StatsService.log_segment($scope.last_segment_start, $scope.last_segment_end);
              $scope.last_segment_end = currentSeconds;
            }
          }

          // Get the enrichment JSON file
          EnrichmentService.get_json($scope.programme_id).then(function(data) {
            $scope.enrichment_enabled = true;

            mediaElement.addEventListener('timeupdate', function() {
              var currentSeconds = Math.floor(mediaElement.currentTime);
              var element = EnrichmentService.get_subtitles(currentSeconds);

              if(element) {
                $rootScope.$apply(function() {
                  $scope.enrichment_nodes.unshift(element);
                });
              }
            });
          }, function(error) {
            $scope.enrichment_enabled = false;
            console.log(error);
          });

          mediaElement.addEventListener('timeupdate', function() {
            calculate_segment();
          });

          mediaElement.addEventListener('seeked', function() {
            calculate_segment();
          });
        }
      });
    }

    StatsService.log("MOBILE_PLAYBACK", {
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

  // Watch Later button click handler function
  $scope.watch_later = function() {
    var player = document.getElementById('video-player');
    var current_time = 0;

    if(player) {
      var current_time = Math.floor(player.currentTime);
    }

    WatchLaterService.store($scope.programme_id, current_time, $scope.programme.watch_live);
  };

  $scope.play = function() {
    var device = WebSocketService.remote_selected();

    if(device) {
      console.log("Calling WebSocketService.play for remote device");
      WebSocketService.play($scope.programme_id, 0, device.socket_id);
    } else {
      console.log("Playing locally");
      document.getElementById('video-player').play();
    }
  };

  $scope.pause = function() {
    var device = WebSocketService.remote_selected();

    if(device) {
      console.log("Calling WebSocketService.pause for remote device");
      WebSocketService.pause(device.socket_id);
    } else {
      console.log("Pausing locally");
      document.getElementById('video-player').pause();
    }
  };

  $scope.tab_selection = 'metadata';

  $scope.switch_tabs = function(mode) {
    $scope.tab_selection = mode;
  }

});
