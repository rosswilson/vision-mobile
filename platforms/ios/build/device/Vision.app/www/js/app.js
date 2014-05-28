// Declare the app level module which loads all it's dependencies
angular.module('vision', ['ngRoute', 'ngResource'])

.run(function($rootScope, AuthService, StatsLogging) {
  FastClick.attach(document.body);

  $rootScope.logged_in = AuthService.is_logged_in();

  $rootScope.$on('LOGGED_IN', function() {
    $rootScope.logged_in = true;
  });

  $rootScope.$on('LOGGED_OUT', function() {
    $rootScope.logged_in = false;
  });

  StatsLogging.log("MOBILE_APP_BOOT", {
    user_agent: navigator.userAgent
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

.service("StatsLogging", function($http, AuthService) {
  return {
    log: function(type, attributes_hash) {
      var extra_attributes = {};
      $.extend(attributes_hash, extra_attributes);

      var user_id = AuthService.user_id() ? AuthService.user_id() : 0;

      $http.get("http://10.42.32.75:9110/capture/log", {
        params: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          log_type: type,
          user_id: user_id,
          attributes: JSON.stringify(attributes_hash)
        }
      });
    }
  }
})

.service('ProgressService', function($http, $q, AuthService) {
  var _url = "http://10.42.32.75:9110/analysis/progress";

  return {
    get: function(programme_ids) {
      var deferred = $q.defer();
      var params = {
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5',
        programme_ids: JSON.stringify(programme_ids),
        user_id: AuthService.user_id()
      }

      var success = function (data, status, headers, config) {
        deferred.resolve(data['data']);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing progress stats analysis service");
      };

      $http.get(_url, { cache: false, params: params }).success(success).error(failure);

      return deferred.promise;
    },
    decorate_programmes: function(programmes) {

      // Build a simple array of all programme IDs
      var prog_ids = jQuery.map(programmes, function(p) { return p.programme_id });

      // Check all prog IDs against /progress stats API
      this.get(prog_ids).then(function(data) {
        var associative_array = {};

        // Convert returned array to an array of objects prog_id => percentage
        $.each(data, function(key, value) {
          associative_array[value.programme_id] = Math.floor(value.progress * 100);
        });

        // Decorate each passed-in programme with it's percentage if known
        $.each(programmes, function(key, value) {
          value.percentage_watched = associative_array[value.programme_id];
        });
      });

    }
  }
});
