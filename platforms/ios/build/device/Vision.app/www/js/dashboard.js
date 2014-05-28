angular.module('vision')

.controller('DashboardCtrl', function ($scope, SetTitle, AuthService, $location,
  RecommendationsEngine, TrendingEngine, $q, StatsLogging, ProgressService) {

  SetTitle("Dashboard");

  $scope.recommendations = null;
  $scope.trending = null;

  $scope.logout = function() {
    AuthService.logout();
    $location.path('/login');
  }

  var r_promise = RecommendationsEngine.get(AuthService.user_id())
  .then(function(recommendations) {
    $scope.recommendations = recommendations;
  }, function(reason) {
    $scope.recommendations_error = true;
    console.log(reason);
  });

  var t_promise = TrendingEngine.get(AuthService.user_id()).then(function(trending) {
    $scope.trending = trending;
  }, function(reason) {
    $scope.trending_error = true;
    console.log(reason);
  });

  $q.all([r_promise, t_promise]).then(function(results) {
    StatsLogging.log("MOBILE_DASHBOARD_LOAD", {
      recommendation_results: $scope.recommendations.length,
      trending_results: $scope.trending.length
    });

    var rec_arr = jQuery.map($scope.recommendations, function(n, i) {
      return n.programme_id;
    });

    var trending_arr = jQuery.map($scope.trending, function(n, i) {
      return n.programme_id;
    });

    ProgressService.get(trending_arr).then(function(data) {
      var associative_array = {};

      $.each(data, function(key, value) {
        associative_array[value.programme_id] = value.progress;
      });

      $.each($scope.trending, function(key, value) {
        value.percentage_watched = (associative_array[value.programme_id] * 100);
      });

      console.log(associative_array);
      console.log($scope.trending);
    });

  });

})

.service('RecommendationsEngine', function($http, $q, QueryStringBuilder, DurationCalculator) {
  var _url = "http://10.42.32.75:9110/recommender/get_recommendations";

  return {
    get: function(user_id) {
      var deferred = $q.defer();
      var params = {
        user_id: user_id,
        seed: 'history',
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5'
      }

      var success = function(data, status, headers, config) {
        DurationCalculator.set_for_array(data);
        deferred.resolve(data);
      }

      var failure = function(data, status, headers, config) {
        deferred.reject("Error getting recommended programmes from the engine");
      }

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
})

.service('TrendingEngine', function($http, $q, QueryStringBuilder, DurationCalculator) {
  var _url = "http://10.42.32.199:2000/trending";

  return {
    get: function(user_id) {
      var deferred = $q.defer();
      var params = {
        user_id: user_id
      }

      var success = function(data, status, headers, config) {
        DurationCalculator.set_for_array(data);
        deferred.resolve(data);
      }

      var failure = function(data, status, headers, config) {
        deferred.reject("Error getting trending programmes from the engine");
      }

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
