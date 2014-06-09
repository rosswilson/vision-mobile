angular.module('vision')

.service("VODBalanceService", function($q, $http) {
  var _url = 'http://10.42.32.199:2000/balance/vod';

  return {
    get: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data[0]);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing VOD load balancing server");
      };

      $http.get(_url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
