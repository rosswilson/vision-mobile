angular.module('vision')

.service("EnrichmentService", function($q, $http) {
  var _json_url = 'http://148.88.67.135/enrichment/';
  var _cache = null;
  var _last_node = null;;

  return {
    get_json: function(programme_id) {
      var deferred = $q.defer();

      var success = function (data, status, headers, config) {
        _cache = data;
        deferred.resolve(data);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting enrichment JSON file");
      };

      var url = _json_url + programme_id + ".json"

      $http.get(url, { cache: false }).success(success).error(failure);
      return deferred.promise;
    },
    get_subtitles: function(position_seconds) {
      if(_cache == null) {
        console.log("ERROR: You need to call get_json(programme_id) to get the JSON enrichment file");
        return false;
      }

      var subtitle = _.find(_cache, function(item) {
        return item.seconds == position_seconds;
      });

      if(subtitle && subtitle != _last_node) {
        console.log(subtitle.raw);
        _last_node = subtitle;
        return subtitle;
      } else {
        return null;
      }
    }
  }
});
