angular.module('vision')

.controller('HistoryCtrl', function ($scope, SetTitle, HistoryService, AuthService) {
  SetTitle("History");

  var success = function(data) {
    $scope.history = data;
  };

  var error = function(error) {
    console.log(error);
  };

  HistoryService.get(AuthService.user_id()).then(success, error);
})

.service('HistoryService', function ($http, $q, QueryStringBuilder) {
  var _url = 'http://10.42.32.75:9110/analysis/viewing_history';

  return {
    get: function(user_id) {
      var deferred = $q.defer();
      var params = {
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5',
        user_id: user_id
      }

      var success = function (data, status, headers, config) {
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting user's history from the API");
      };

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
