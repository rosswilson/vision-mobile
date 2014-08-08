angular.module('vision')

.service('RecommendationService', function($http, $q, QueryStringBuilder, DurationService) {
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
        DurationService.set_for_array(data);
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
});
