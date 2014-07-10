angular.module('vision')

  .service('WebSocketService', function() {
    var conn;

    return {
      init: function() {
        console.log("WS connecting");
        conn = io("http://10.32.112.73:80/");
      },
      play: function(programme_id, start_at) {
        console.log("Play command sending over WS");
        conn.emit('play', {
          programme_id: programme_id,
          start_at: start_at
        });
      },
      pause: function() {
        conn.emit('pause');
      },
      resume: function() {
        conn.emit('resume');
      }
    }
  });
