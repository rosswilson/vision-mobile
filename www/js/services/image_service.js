angular.module('vision')

.service("ImageService", function() {
  return {
    get_url: function(path, width, height) {
      return "http://148.88.32.64/cache/" + width + "x" + height + "/programmes" + path;
    }
  }
});
