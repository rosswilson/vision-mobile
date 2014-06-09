angular.module('vision')

.service('TrendingService', function($http, $q, QueryStringBuilder, DurationService) {
  var _url = "http://10.42.32.199:2000/trending";

  return {
    get: function(user_id) {
      var deferred = $q.defer();
      var params = {
        user_id: user_id
      }

      var success = function(data, status, headers, config) {
        DurationService.set_for_array(data);
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
