angular.module('vision')

.controller('DashboardCtrl', function ($scope, CurrentlyAiring, SetTitle) {
  SetTitle("Dashboard");

  var promise = CurrentlyAiring.get();

  promise.then(function(programmes) {
    $scope.programmes = programmes;
  }, function(reason) {
    console.log(reason);
  });
})

.service('CurrentlyAiring', function ($http, $q, $cacheFactory) {
  var _url = 'http://vision.lancs.ac.uk/JSON_CACHE/currently_airing.json';
  var cache = $cacheFactory('currently_airing');

  return {
    get: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      $http.get(_url, { cache: true }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
