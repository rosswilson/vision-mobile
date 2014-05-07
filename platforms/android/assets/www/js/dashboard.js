angular.module('vision')

.controller('DashboardCtrl', function ($scope, CurrentlyAiring) {
  var promise = CurrentlyAiring.get();

  promise.then(function(programmes) {
    $scope.programmes = programmes;
  }, function(reason) {
    console.log(reason);
  });
})

.service('CurrentlyAiring', function ($http, $q) {
  var _url = 'http://vision.lancs.ac.uk/JSON_CACHE/currently_airing.json';

  return {
    get: function() {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      $http.get(_url).success(success).error(failure);

      return deferred.promise;
    }
  }
});
