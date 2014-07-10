angular.module('vision')

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
