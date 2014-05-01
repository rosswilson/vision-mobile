var EmployeeView = function(adapter, template, employee) {

  this.render = function() {
    this.el.html(template(employee));
    return this;
  };

  this.initialize = function() {
    this.el = $('<div/>');
  };

  this.initialize();

}
