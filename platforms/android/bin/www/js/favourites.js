angular.module('vision')

.controller('FavouritesCtrl', function ($scope, SetTitle) {
  SetTitle("Favourites");
  
  function success(resultArray) {
    alert("Scanned " + resultArray[0] + " code: " + resultArray[1]);
  }

  function failure(error) {
    alert("Failed: " + error);
  }


  $scope.scan = function() {
    cordova.exec(success, failure, "ScanditSDK", "scan", ["e46Phtm3EeOMxvA/6Y9O+pYhXU1KP+x3luN98zcmTuM",{}]);
  }
})
