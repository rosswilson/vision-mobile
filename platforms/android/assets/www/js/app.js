// Declare the app level module which loads all it's dependencies
angular.module('vision', ['ngRoute', 'ngResource'])

.config(function($routeProvider) {
  $routeProvider.
  when('/dashboard', {
    templateUrl: 'dashboard.html',
    controller: 'DashboardCtrl'
  }).
  when('/favourites', {
    templateUrl: 'favourites.html',
    controller: 'FavouritesCtrl'
  }).
  when('/history', {
    templateUrl: 'history.html',
    controller: 'HistoryCtrl'
  }).
  when('/search', {
    templateUrl: 'search.html',
    controller: 'SearchCtrl'
  }).
  when('/programmes/:programme_id', {
    templateUrl: 'partials/programme-detail.html',
    controller: 'ProgrammeDetailCtrl'
  }).
  otherwise({
    redirectTo: '/dashboard'
  });
})

.factory('SetTitle', function ($rootScope) {
  return function(name) {
    $rootScope.title = name;
  };
});
