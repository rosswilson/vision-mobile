angular.module('vision')

.service("DurationCalculator", function() {
  return {
    // Returns integer number of minutes given a HH:MM:SS format string
    from_hh_mm_ss: function(time) {
      if(typeof(time) != 'string' || time.indexOf(":") == -1) {
        return time;
      }
      var parts = time.split(':');
      var hours_to_mins = parseInt(parts[0]) * 60;

      if(parts[2]) {
        var seconds_to_mins = parseInt(parts[2]) / 60;
        return Math.ceil(hours_to_mins + parseInt(parts[1]) + seconds_to_mins);
      } else {
        return Math.ceil(hours_to_mins + parseInt(parts[1]));
      }
    },
    set_for_array: function(array) {
      var self = this;
      $.each(array, function(key, value) {
        value['duration_mins'] = self.from_hh_mm_ss(value['duration']);
      });
    }
  }
});
