angular.module('vision')

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
});
