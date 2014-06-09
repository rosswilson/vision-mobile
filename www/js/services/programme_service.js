angular.module('vision')

.service('ProgrammeService', function ($http, $q, QueryStringBuilder, VODBalanceService) {
  var _url = 'http://10.42.32.184/search2.php';

  return {
    get: function(programme_id) {
      var deferred = $q.defer();
      var params = {
        q: programme_id,
        qf: 'programme_id',
        start: 0,
        rows: 10,
        url: '/future/select',
        wt: 'json',
        send_filters: false,
        sort: 'score+desc',
        raw_duration: true
      }

      // Fire the SOLR search query and store the promise
      var url = _url + '?' + QueryStringBuilder(params);
      var search_promise = $http.get(url, { cache: false });

      // Fire the VOD load balance query and store the promise
      var lb_promise = VODBalanceService.get();

      // Once both promises have returned we process the data and return the main promise
      $q.all([search_promise, lb_promise]).then(function(results) {
        var programme = results[0].data.response.docs[0];
        var vod_server = results[1].ip || "148.88.32.70";

        if(programme) {

          // Set the playback URL either to the VOD file or live stream address
          if(programme.watch_catchup) {
            programme['playback_url'] = 'http://' + vod_server + '/' + programme.programme_id + '.mp4';
          } else if(programme.watch_live) {
            programme['playback_url'] = 'http://10.42.67.123:1935/live/mp4:' + programme.wowza_code + '/playlist.m3u8';
          }

          programme['channel_image'] = programme['image'].replace(/[^/]*$/, '404.jpg');

          deferred.resolve(programme);
        } else {
          deferred.reject("Unknown programme ID");
        }

      });

      return deferred.promise;
    }
  }
});
