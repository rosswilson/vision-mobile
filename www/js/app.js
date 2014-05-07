// Declare the app level module which loads all it's dependencies
angular.module('vision', ['ngRoute', 'ngResource'])

.config(function($routeProvider) {
  $routeProvider.
  when('/dashboard', {
    templateUrl: 'dashboard.html',
    controller: 'DashboardCtrl'
  }).
  when('/programmes/:programme_id', {
    templateUrl: 'partials/programme-detail.html',
    controller: 'ProgrammeDetailCtrl'
  }).
  otherwise({
    redirectTo: '/dashboard'
  });
});
