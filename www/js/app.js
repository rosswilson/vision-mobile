// Declare the app level module which loads all it's dependencies
angular.module('vision', ['ngRoute', 'ngResource', 'ngAnimate'])

.run(function($rootScope, AuthService) {
  FastClick.attach(document.body);

  $rootScope.logged_in = AuthService.is_logged_in();

  $rootScope.$on('LOGGED_IN', function() {
    $rootScope.logged_in = true;
  });

  $rootScope.$on('LOGGED_OUT', function() {
    $rootScope.logged_in = false;
  });
})

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
  when('/guide', {
    templateUrl: 'guide.html',
    controller: 'GuideCtrl'
  }).
  when('/programmes/:programme_id', {
    templateUrl: 'playback.html',
    controller: 'PlaybackCtrl'
  }).
  when('/login', {
    templateUrl: 'login.html',
    controller: 'LoginCtrl'
  }).
  otherwise({
    redirectTo: '/login'
  });
})

.factory('SetTitle', function ($rootScope) {
  return function(name) {
    $rootScope.title = name;
  };
})

.factory('QueryStringBuilder', function() {
  return function(data) {
   var ret = [];
   for (var d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
   return ret.join("&");
  }
});
