angular.module('vision')

.service('CurrentlyAiring', function ($http, $q, DurationService) {
  var _url = 'http://vision.lancs.ac.uk/JSON_CACHE/currently_airing.json';

  return {
    get: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        DurationService.set_for_array(data);
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      $http.get(_url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
