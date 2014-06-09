angular.module('vision')

.controller('SearchCtrl', function ($scope, SetTitle, SearchService, StatsLogging, ProgressService) {
  SetTitle("Search");

  StatsLogging.log("MOBILE_SEARCH_LOADED");

  $scope.show_spinner = false;
  $scope.results = null;

  $scope.search = function() {
    $scope.show_spinner = true;
    $scope.results = null;

    var success = function(results) {
      $scope.show_spinner = false;

      $scope.results = results;

      // Decorate programmes with the percentage watched
      ProgressService.decorate_programmes($scope.results);

      StatsLogging.log("MOBILE_SEARCH_RESULTS", {
        num_results: results.length,
        is_error: "false",
        query: $scope.query
      });
    }

    var error = function(reason) {
      $scope.search_error = true;
      $scope.show_spinner = false;
      console.log("Error getting search results");
      StatsLogging.log("MOBILE_SEARCH_RESULTS", {
        num_results: 0,
        is_error: "true"
      });
    }

    var promise = SearchService.get($scope.query).then(success, error);
  }

})

.service('SearchService', function ($http, $q, QueryStringBuilder) {
  var _url = 'http://10.42.32.184/search2.php';

  return {
    get: function(keyword) {
      var deferred = $q.defer();
      var params = {
        q: keyword,
        start: 0,
        rows: 30,
        url: '/future/select',
        wt: 'json',
        send_filters: false,
        sort: 'score+desc'
      }

      var success = function (data, status, headers, config) {
        var temp = [];

        $.each(data.response.docs, function(key, value) {
          if(!value.waiting_to_be_recorded && !value.not_available) {
            temp.push(value);
          }
        });

        deferred.resolve(temp);
      };

      var failure = function (data, status, headers, config) {
        deferred.reject("Error accessing SOLR engine for search service");
      };

      var url = _url + '?' + QueryStringBuilder(params);
      $http.get(url, { cache: false }).success(success).error(failure);

      return deferred.promise;
    },
    get_poster_url: function(programme, width, height) {
      return "http://148.88.32.64/cache/" + width + "x" + height + "/programmes" + programme.image;
    }
  }
});
