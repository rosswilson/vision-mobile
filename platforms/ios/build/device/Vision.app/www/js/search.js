angular.module('vision')

.controller('SearchCtrl', function ($scope, SetTitle, SearchService, StatsService, ProgressService) {
  SetTitle("Search");

  StatsService.log("MOBILE_SEARCH_LOADED");

  $scope.show_spinner = false;
  $scope.results = null;

  $scope.search = function() {
    $scope.show_spinner = true;
    $scope.results = null;

    var success = function(results) {
      $scope.show_spinner = false;

      $scope.results = results;

      // Decorate programmes with the percentage watched
      ProgressService.decorate_programmes($scope.results);

      StatsService.log("MOBILE_SEARCH_RESULTS", {
        num_results: results.length,
        is_error: "false",
        query: $scope.query
      });
    }

    var error = function(reason) {
      $scope.search_error = true;
      $scope.show_spinner = false;
      console.log("Error getting search results");
      StatsService.log("MOBILE_SEARCH_RESULTS", {
        num_results: 0,
        is_error: "true"
      });
    }

    var promise = SearchService.get($scope.query).then(success, error);
  }

});
