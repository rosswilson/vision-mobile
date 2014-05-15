angular.module('vision')

.controller('GuideCtrl', function ($scope, SetTitle, CurrentlyAiring) {
  SetTitle("Programme Guide");

  CurrentlyAiring.get().then(function(programmes) {
    $scope.programmes = programmes;
  }, function(reason) {
    console.log(reason);
  });
});
