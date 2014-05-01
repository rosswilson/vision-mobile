var EPGSource = function() {

  var JSON_CACHE_ROOT = 'http://vision.lancs.ac.uk/JSON_CACHE';

  this.initialize = function() {
    var deferred = $.Deferred();
    deferred.resolve();
    return deferred.promise();
  }

  this.currentlyAiring = function() {
    return $.ajax({url: JSON_CACHE_ROOT + "/currently_airing.json", dataType: "json"});
  }

  // this.findById = function(id) {
  //   return $.ajax({url: url + "/" + id, dataType: "jsonp"});
  // }
  //
  // this.findByName = function(searchKey) {
  //   return $.ajax({url: url + "?name=" + searchKey, dataType: "jsonp"});
  // }

}
