angular.module('vision')

  .service('WebSocketService', function(AuthService, $rootScope) {
    var conn;
    var connected_devices = [];

    return {
      init: function() {
        var self = this;

        console.log("WS connecting");
        conn = io("http://10.32.112.73:80/");

        conn.on('connect', function() {
          self.set_room();
        });

        conn.on('reconnect', function() {
          console.log("WS reconnected");
        });

        conn.on('connected_devices', function(msg) {
          connected_devices = msg;
          $rootScope.$broadcast('connected_devices', msg);
        });
      },
      set_room: function() {
        console.log("Sending set_room command");
        conn.emit('set_room', {
          user_id: AuthService.user_id(),
          device_name: 'Mobile App',
          can_playback: false,
          user_agent: navigator.userAgent
        });
      },
      play: function(programme_id, start_at, socket_id) {
        console.log("Play command sending over WS");
        conn.emit('play', {
          programme_id: programme_id,
          start_at: start_at,
          socket_id: socket_id
        });
      },
      pause: function(socket_id) {
        conn.emit('pause', { socket_id: socket_id });
      },
      resume: function(socket_id) {
        conn.emit('resume', { socket_id: socket_id });
      },
      get_connected_devices: function() {
        return connected_devices;
      }
    }
  });
