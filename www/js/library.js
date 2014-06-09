angular.module('vision')

.controller('LibraryCtrl', function ($scope, SetTitle, WatchLaterService, AuthService, StatsService, ProgressService) {
  SetTitle("My Library");

  $scope.watch_later = null;

  WatchLaterService.get(AuthService.user_id()).then(function(watch_later) {
    $scope.watch_later = watch_later;

    // Decorate programmes with the percentage watched
    ProgressService.decorate_programmes($scope.watch_later);

    StatsService.log("MOBILE_LIBARY_LOAD", {
      num_results: watch_later.length
    });
  }, function(reason) {
    $scope.library_error = true;
    console.log(reason);

    StatsService.log("MOBILE_LIBARY_LOAD", {
      num_results: 0,
      error: reason
    });
  });

});
