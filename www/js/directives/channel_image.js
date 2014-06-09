angular.module('vision')

.directive('channelImage', function(ImageService) {
  return {
    restrict: 'E',
    template: '<img src="{{ image_path }}" />',
    scope: {
      path: "=path"
    },
    replace: true,
    link: function(scope, element, attrs) {
      var width = attrs.width || 200;
      var height = attrs.height || 112;

      scope.$watch('path', function(path) {
        scope.image_path = ImageService.get_url(path, width, height);
      });
    }
  }
});
