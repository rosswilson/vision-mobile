angular.module('vision')

.service("StatsService", function(AuthService, $http) {
  var _heartbeat_id = null;

  return {
    player_instance: function(programme_id, file_url) {
      _heartbeat_id = CryptoJS.SHA1("mobile" + Math.random() + programme_id).toString();
      console.log("Logging player instance, heartbeat ID: %s", _heartbeat_id);

      $http.get("http://10.42.32.75:9110/capture/player_instance", {
        params: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          programme_id: programme_id,
          file_id: file_url
        }
      });
    },
    log_segment: function(start, end) {
      $http.get("http://10.42.32.75:9110/capture/heartbeat", {
        params: {
          api: "53e659a15aff4a402de2d51b98703fa1ade5b8c5",
          heartbeat_id: _heartbeat_id,
          user_id: AuthService.user_id(),
          start: start,
          end: end
        }
      });
    },
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
});
