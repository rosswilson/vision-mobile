angular.module('vision')

// Wowza server with access to data.lancs:
// http://10.42.32.183:1935/vod/mp4:937745aafa7c912ded00a3df8f10ada72c014133.mp4/playlist.m3u8

.controller('PlaybackCtrl', function ($scope, SetTitle, $routeParams, ProgrammeService) {
  SetTitle("Watch Programme");

  $scope.programme_id = $routeParams['programme_id'];
  $scope.live_channel = $routeParams['live_channel'];

  var video_url = function() {
    if ($scope.live_channel) {
      return "http://10.42.67.123:1935/live/mp4:" + $scope.live_channel + "/playlist.m3u8";
    } else {
      return $scope.programme.vod_url;
    }
  }

  var promise = ProgrammeService.get($scope.programme_id);
  promise.then(function(data) {
    // Store the programme in the scope
    $scope.programme = data;

    console.log(data);

    // Page title will be programme name
    SetTitle(data.programme_name);

    // Init the video player, set it's src, load, then play
    var player = document.getElementById('video-player');
    player.setAttribute("src", video_url());
    // player.load();
    // player.play();
  }, function(error) {
    console.log(error);
  });
})

.service('ProgrammeService', function ($http, $q, $cacheFactory, QueryStringBuilder) {
  var _url = 'http://vision.lancs.ac.uk:9110/modules/videometa/get_video_meta';
  var cache = $cacheFactory('programmes');

  return {
    get: function(programme_id) {
      var deferred = $q.defer();
      var params = {
        api: '53e659a15aff4a402de2d51b98703fa1ade5b8c5',
        programme_id: programme_id
      }

      var success = function (data, status, headers, config) {
        if(data['num_res']) {
          var programme = data['data'][0];
          programme['vod_url'] = 'http://148.88.32.70/' + programme_id + '.mp4';
          deferred.resolve(programme);
        }
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error getting currently airing JSON cache file");
      };

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: true }).success(success).error(failure);

      return deferred.promise;
    }
  }
})

.factory('QueryStringBuilder', function() {
  return function(data) {
   var ret = [];
   for (var d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
   return ret.join("&");
  }
});
