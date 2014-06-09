angular.module('vision')

.controller('DashboardCtrl', function ($scope, SetTitle, AuthService,
  RecommendationService, TrendingService, $q, StatsService, ProgressService) {

  SetTitle("Dashboard");

  // Init recommendations and trending lists to null so loading spinner shows
  $scope.recommendations = null;
  $scope.trending = null;

  // Logout function called by Dashboard footer link
  $scope.logout = function() {
    AuthService.logout();
  }

  // Get recommendations from RecommendationsEngine
  var r_promise = RecommendationService.get(AuthService.user_id()).then(

    // If success, store recommendations on scope and decorate each with progress watched
    function(recommendations) {
      $scope.recommendations = recommendations;

      // Decorate programmes with the percentage watched
      ProgressService.decorate_programmes($scope.recommendations);
    },

    // If error, set flag to show error warning message
    function(reason) {
      $scope.recommendations_error = true;
      console.log(reason);
    }

  );

  // Get trending programmes from TrendingEngine
  var t_promise = TrendingService.get(AuthService.user_id()).then(

    // If success, store programmes on scope and decorate each with progress watched
    function(trending) {
      $scope.trending = trending;

      // Decorate programmes with the percentage watched
      ProgressService.decorate_programmes($scope.trending);
    },

    // If error, set flag to show error warning message
    function(reason) {
      $scope.trending_error = true;
      console.log(reason);
    }
  );

  // Once both recommendations and trending calls have returned, send stats log message
  $q.all([r_promise, t_promise]).then(function(results) {
    StatsService.log("MOBILE_DASHBOARD_LOAD", {
      recommendation_results: $scope.recommendations.length,
      trending_results: $scope.trending.length
    });
  });

});
