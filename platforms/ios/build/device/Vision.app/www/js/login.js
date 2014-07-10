angular.module('vision')

.controller('LoginCtrl', function ($scope, SetTitle, AuthService, $location, StatsService) {
  SetTitle("Login");

  $scope.pin_code = '';

  // If already logged in, redirect to dashboard
  if(AuthService.is_logged_in()) {
   $location.path('/dashboard');
  }

  $("#instructions").click(function() {
    $("#screenshot_container").toggleClass("visible");
  });

  // If submitted code is valid, redirect to dashboard
  $scope.login = function() {
    var success = function(data) {
      StatsService.log("MOBILE_LOGIN_SUCCESS");
      $location.path('/dashboard');
    };

    var error = function(error) {
      console.log(error);

      if(error == 0) {
        $scope.error_message = "Can't access Vision. Are you on Lancaster's network?";
        $scope.pin_code = '';
      } else {
        $scope.error_message = "Invalid PIN code, please retry";
        $scope.pin_code = '';
      }

      StatsService.log("MOBILE_LOGIN_FAIL");
    };

    AuthService.verify($scope.pin_code).then(success, error);
  }

  $scope.append = function(char) {
    if($scope.pin_code.length == 5) {
      $scope.pin_code = char;
    } else {
      $scope.pin_code += char;
    }
  }

  $scope.clear = function() {
    $scope.pin_code = '';
    $scope.error_message = null;
  }
});
