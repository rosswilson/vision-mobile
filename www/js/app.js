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
  when('/library', {
    templateUrl: 'library.html',
    controller: 'LibraryCtrl'
  }).
  when('/history', {
    templateUrl: 'history.html',
    controller: 'HistoryCtrl'
  }).
  when('/search', {
    templateUrl: 'search.html',
    controller: 'SearchCtrl'
  }).
  when('/live', {
    templateUrl: 'live.html',
    controller: 'LiveCtrl'
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
}).

service("DurationCalculator", function() {
  return {
    // Returns integer number of minutes given a HH:MM:SS format string
    from_hh_mm_ss: function(time) {
      if(typeof(time) != 'string' || time.indexOf(":") == -1) {
        return time;
      }
      var parts = time.split(':');
      var hours_to_mins = parseInt(parts[0]) * 60;

      if(parts[2]) {
        var seconds_to_mins = parseInt(parts[2]) / 60;
        return Math.ceil(hours_to_mins + parseInt(parts[1]) + seconds_to_mins);
      } else {
        return Math.ceil(hours_to_mins + parseInt(parts[1]));
      }
    },
    set_for_array: function(array) {
      var self = this;
      $.each(array, function(key, value) {
        value['duration_mins'] = self.from_hh_mm_ss(value['duration']);
      });
    }
  }
})
