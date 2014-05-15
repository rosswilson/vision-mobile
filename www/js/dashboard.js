angular.module('vision')

.controller('DashboardCtrl', function ($scope, SetTitle, AuthService, $location, RecommendationsEngine, TrendingEngine) {
  SetTitle("Dashboard");

  $scope.logout = function() {
    AuthService.logout();
    $location.path('/login');
  }

  RecommendationsEngine.get(AuthService.user_id()).then(function(recommendations) {
    $scope.recommendations = recommendations;
  }, function(reason) {
    console.log(reason);
  });

  TrendingEngine.get(AuthService.user_id()).then(function(trending) {
    $scope.trending = trending;
  }, function(reason) {
    console.log(reason);
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
        var temp = [];

        $.each(data, function(key, value) {
          // Only allow VOD COMPLETE programmes through
          if(value['vod_status'] === 'COMPLETE') {
            temp.push(value);
          }
        });

        DurationCalculator.set_for_array(temp);
        deferred.resolve(temp);
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
        var temp = [];

        $.each(data, function(key, value) {
          // Only allow VOD COMPLETE programmes through
          if(value['vod_status'] === 'COMPLETE') {
            temp.push(value);
          }
        });

        DurationCalculator.set_for_array(temp);
        deferred.resolve(temp);
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
