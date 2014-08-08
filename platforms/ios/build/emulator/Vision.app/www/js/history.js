angular.module('vision')

.controller('HistoryCtrl', function ($scope, SetTitle, HistoryService, AuthService, StatsService) {
  SetTitle("History");

  $scope.history = null;

  HistoryService.get(AuthService.user_id()).then(function(data) {
    $scope.history = data;

    StatsService.log("MOBILE_HISTORY_LOAD", {
      num_results: data.length
    });
  }, function(reason) {
    $scope.history_error = true;
    console.log(reason);
    StatsService.log("MOBILE_HISTORY_LOAD", {
      num_results: 0,
      error: reason
    });
  });
});
