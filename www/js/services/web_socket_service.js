angular.module('vision')

  .service('WebSocketService', function(AuthService, $rootScope) {
    var conn;

    var devices = [];
    var local_selected = true;
    var current_selected = null;

    return {
      init: function() {
        var self = this;

        console.log("WS connecting");

        // Important to force port 80, since in dev it'll try to use the same port
        // as requested the Vision Mobile page (usually port 81)
        conn = io("http://148.88.227.217:80/");

        conn.on('connect', function() {
          console.log("WS connected");
          self.set_room();
        });

        conn.on('connected_devices', function(new_devices) {
          $rootScope.$apply(function() {
            devices = new_devices;

            if(current_selected) {
              var previous_selected = _.find(devices, function(device) {
                return current_selected.socket_id == device.socket_id;
              });

              if(previous_selected) {
                current_selected = previous_selected;
                current_selected.selected = true;
                local_selected = false;
              } else {
                local_selected = true;
              }
            }

            $rootScope.$broadcast('connected_devices', devices);
            console.log(devices);
          });
        });

        conn.on('progress_update', function(data) {
          console.log(data);
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

        // Unselect the currently selected device
        if(current_selected) {
          current_selected.selected = false;
        }

        // Find the device with the passed socket ID
        var device = _.find(devices, function(device) {
          return device.socket_id == socket_id;
        });

        // If we found the device, select it, else select local
        if(device) {
          device.selected = true;
          current_selected = device;

          local_selected = false;
        } else {
          current_selected = null;
          local_selected = true;
        }
      },
      select_local: function() {
        _.each(devices, function(device) {
          device.selected = false;
        });

        local_selected = true;
        current_selected = null;
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
      },
      remote_selected: function() {
        return current_selected;
      }
    }
  });
