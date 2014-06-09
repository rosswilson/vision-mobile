angular.module('vision')

.service("PlayerStatsService", function(AuthService, $http, StatsLogging) {
  var _heartbeat_id = null;

  return {
    new_instance: function(programme_id, file_url) {
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
    }
  }
});
