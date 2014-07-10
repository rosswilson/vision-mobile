angular.module('vision')

.controller('LiveCtrl', function ($scope, SetTitle, CurrentlyAiring, StatsService, ProgressService) {
  SetTitle("Live Channels");

  $scope.programmes = null;

  CurrentlyAiring.get().then(function(programmes) {
    $scope.programmes = programmes;

    // Decorate programmes with the percentage watched
    ProgressService.decorate_programmes($scope.programmes);

    StatsService.log("MOBILE_LIVE_LOAD", {
      num_results: programmes.length,
    });
  }, function(reason) {
    $scope.live_error = true;
    console.log(reason);

    StatsService.log("MOBILE_LIVE_LOAD", {
      num_results: 0,
      error: reason
    });
  });
});
