angular.module('vision')

  .filter('userAgentParser', function() {
    return function(text) {
      if(/PlayStation 3/g.test(text)) {
        return "PlayStation 3";
      } else if (/PlayStation 4/g.test(text)) {
          return "PlayStation 4";
      } else if (/Chrome/g.test(text)) {
        return "Chrome";
      } else if (/iPad/g.test(text)) {
        return "iPad";
      } else if (/iPhone/g.test(text)) {
        return "iPhone";
      } else if (/Android/g.test(text)) {
        return "Android Device";
      } else {
        return "Unknown Device";
      }
    }
  });
