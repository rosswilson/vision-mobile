var HomeView = function (adapter) {

  var template = Handlebars.compile($("#home-tpl").html());
  var listItemTemplate = Handlebars.compile($("#employee-li-tpl").html());

  this.render = function() {
    this.el.html(template());
    return this;
  };

  this.findByName = function() {
    adapter.findByName($('.search-key').val()).done(function(employees) {
        $('.employee-list').html(listItemTemplate(employees));
    });
  };

  this.initialize = function () {
    // Define a div wrapper for the view. The div wrapper is used to attach events.
    this.el = $('<div/>');
    this.el.on('keyup', '.search-key', this.findByName);
  };

  this.initialize();

}
