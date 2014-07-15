angular.module('vision')

  .service('WebSocketService', function(AuthService, $rootScope) {
    var conn;
    var devices = [];
    var local_selected = true;

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
          $rootScope.$apply(function() {
            devices = msg;
            $rootScope.$broadcast('connected_devices', msg);
          });
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
      select_device: function(socket_id) {
        _.each(devices, function(device) {
          device.selected = false;
        });

        var device = _.find(devices, function(device) {
          return device.socket_id == socket_id;
        });

        if(device) {
          local_selected = false;
          device.selected = true;
        } else {
          local_selected = true;
        }
      },
      select_local: function() {
        _.each(devices, function(device) {
          device.selected = false;
        });

        local_selected = true;
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
        return devices;
      },
      local_selected: function() {
        return local_selected;
      }
    }
  });
