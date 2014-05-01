// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

  var homeTpl = Handlebars.compile($("#home-tpl").html());
  var employeeLiTpl = Handlebars.compile($("#employee-li-tpl").html());
  var employeeTpl = Handlebars.compile($("#employee-tpl").html());

  /* ---------------------------------- Local Variables ---------------------------------- */
  var adapter = new MemoryAdapter();
  adapter.initialize().done(function () {
    route();
    console.log("Data adapter initialized");
  });

  var detailsURL = /^#employees\/(\d{1,})/;

  /* --------------------------------- Event Registration -------------------------------- */

  FastClick.attach(document.body);

  // Setup custom alert dialog
  document.addEventListener('deviceready', function () {
    if (navigator.notification) { // Override default HTML alert with native dialog
      window.alert = function (message) {
        navigator.notification.alert(
          message,    // message
          null,       // callback
          "Vision", // title
          'OK'        // buttonName
        );
      };
    }
  }, false);

  $(window).on('hashchange', route);

  /* --------------------------------- Local Functions ----------------------------------- */
  function route() {
    var hash = window.location.hash;
    if (!hash) {
      $('body').html(new HomeView(adapter, homeTpl, employeeLiTpl).render().el);
      return;
    }
    var match = hash.match(detailsURL);
    if (match) {
      adapter.findById(Number(match[1])).done(function(employee) {
        $('body').html(new EmployeeView(adapter, employeeTpl, employee).render().el);
      });
    }
  }

}());
