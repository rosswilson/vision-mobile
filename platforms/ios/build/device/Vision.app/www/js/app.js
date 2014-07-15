// Declare the app level module which loads all it's dependencies
angular.module('vision', ['ngRoute', 'ngResource'])

.run(function($rootScope, AuthService, StatsService, $location, WebSocketService) {
  FastClick.attach(document.body);

  $rootScope.logged_in = AuthService.is_logged_in();

  WebSocketService.init();
  $rootScope.sockets = WebSocketService;

  $rootScope.local_user_agent = navigator.userAgent;

  $rootScope.$on('LOGGED_OUT', function() {
    $rootScope.logged_in = false;
    $location.path('/login');
  });

  StatsService.log("MOBILE_APP_BOOT", {
    user_agent: navigator.userAgent
  });
})

.config(function($routeProvider) {
  $routeProvider.
  when('/dashboard', {
    templateUrl: 'templates/dashboard.html',
    controller: 'DashboardCtrl'
  }).
  when('/library', {
    templateUrl: 'templates/library.html',
    controller: 'LibraryCtrl'
  }).
  when('/history', {
    templateUrl: 'templates/history.html',
    controller: 'HistoryCtrl'
  }).
  when('/search', {
    templateUrl: 'templates/search.html',
    controller: 'SearchCtrl'
  }).
  when('/live', {
    templateUrl: 'templates/live.html',
    controller: 'LiveCtrl'
  }).
  when('/programmes/:programme_id', {
    templateUrl: 'templates/playback.html',
    controller: 'PlaybackCtrl'
  }).
  when('/login', {
    templateUrl: 'templates/login.html',
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
    for (var d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
})

.filter('cut', function () {
  return function (value, wordwise, max, tail) {
    if (!value) return '';

    max = parseInt(max, 10);
    if (!max) return value;
    if (value.length <= max) return value;

    value = value.substr(0, max);
    if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace != -1) {
        value = value.substr(0, lastspace);
      }
    }

    return value + (tail || ' …');
  };
});
