var WhatsOnView = function () {

  var epg_source = new EPGSource();

  var template = Handlebars.compile($("#whats-on-tpl").html());
  var list_item_template = Handlebars.compile($("#whats-on-tpl-item").html());

  this.render = function() {
    this.el.html(template());

    epg_source.currentlyAiring().done(function(channels) {
        $('.channel-list').html(list_item_template(channels));
    });

    return this;
  };

  this.initialize = function () {
    // Define a div wrapper for the view. The div wrapper is used to attach events.
    this.el = $('<div/>');
    // this.el.on('keyup', '.search-key', this.findByName);
  };

  this.initialize();

}
