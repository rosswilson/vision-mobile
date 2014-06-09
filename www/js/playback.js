angular.module('vision')

.controller('PlaybackCtrl', function ($scope, SetTitle, $routeParams, ProgrammeService,
  PlayerStatsService, WatchLaterService, StatsLogging, ImageService) {

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

      // Set channel image URL
      $scope.programme.channel_image = ImageService.get_url($scope.programme.channel_image, 100, 56);

      // Set the video player poster image if not resuming (since we'll immediately start playing)
      var player = document.getElementById('video-player');
      player.setAttribute("poster", ImageService.get_url($scope.programme.image, 720, 405));

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
});
