angular.module('vision')

.controller('LoginCtrl', function ($scope, SetTitle, AuthService, $location) {
  SetTitle("Login");

  $scope.pin_code = '';

  // If already logged in, redirect to dashboard
  if(AuthService.is_logged_in()) {
   $location.path('/dashboard');
  }

  // If submitted code is valid, redirect to dashboard
  $scope.login = function() {
    var success = function(data) {
      $location.path('/dashboard');
    };

    var error = function(error) {
      $scope.error_message = "Invalid PIN code";
      $scope.pin_code = '';
    };

    AuthService.verify($scope.pin_code).then(success, error);
  }

  $scope.append = function(char) {
    $scope.pin_code += char;
  }
})

.service('AuthService', function($rootScope, $http, $q, QueryStringBuilder) {
  var _url = "http://vision.lancs.ac.uk:9110/user/verify_external_pin";

  return {
    verify: function(pin_code) {
      var deferred = $q.defer();

      var params = {
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5',
        pin: pin_code
      }

      var success = function (data, status, headers, config) {
        var user = data['data'][0];
        window.localStorage.setItem("user_id", user['user_id']);
        $rootScope.$broadcast('LOGGED_IN');
        deferred.resolve(user);
      };

      var failure = function (data, status, headers, config) {
        if(status == 500 || status == 401) {
          deferred.reject("Authentication PIN code is invalid");
        } else {
          deferred.reject("Authentication API communication error, code: " + status);
        }
      };

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url).success(success).error(failure);

      return deferred.promise;
    },
    logout: function() {
      window.localStorage.removeItem("user_id");
      $rootScope.$broadcast('LOGGED_OUT');
    },
    user_id: function() {
      return window.localStorage.getItem("user_id");
    },
    is_logged_in: function() {
      return this.user_id() !== null;
    }
  }
});