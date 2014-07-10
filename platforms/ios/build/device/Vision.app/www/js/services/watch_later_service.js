angular.module('vision')

.service('WatchLaterService', function ($http, $q, QueryStringBuilder, DurationService, AuthService) {
  var _get_url = 'http://vision.lancs.ac.uk:9110/modules/library/get_paused_content';
  var _post_url = "http://vision.lancs.ac.uk:9110/modules/library/pause_content";

  return {
    get: function(user_id) {
      var deferred = $q.defer();
      var params = {
        user_id: user_id,
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5'
      }

      var success = function (data, status, headers, config) {
        var data = data['data'];
        DurationService.set_for_array(data);
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      var url = _get_url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    },
    store: function(programme_id, position, is_live) {
      var deferred = $q.defer();
      var params = {
        programme_id: programme_id,
        user_id: AuthService.user_id(),
        position: position,
        status: 0,
        live: is_live,
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5'
      };

      var success = function (data, status, headers, config) {
        if(data['affected']) {
          deferred.resolve(data);
        }
      };

      var failure = function (data, status, headers, config) {
        console.log(data);
        deferred.reject("Error storing Watch Later");
      };

      var url = _post_url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    }
  }
});
