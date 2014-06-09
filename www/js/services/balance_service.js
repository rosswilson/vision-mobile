angular.module('vision')

.service("BalanceService", function($q, $http) {
  var _vod_url = 'http://10.42.32.199:2000/balance/vod';
  var _live_url = 'http://10.42.32.199:2000/balance/vod';

  return {
    get_vod_server: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data[0]);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing VOD load balancing server");
      };

      $http.get(_vod_url, { cache: false }).success(success).error(failure);
      return deferred.promise;
    },
    get_live_server: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data[0]);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing VOD load balancing server");
      };

      $http.get(_live_url, { cache: false }).success(success).error(failure);
      return deferred.promise;
    }
  }
});
