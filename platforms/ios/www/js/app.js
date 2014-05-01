// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

  var homeTpl = Handlebars.compile($("#home-tpl").html());
  var employeeLiTpl = Handlebars.compile($("#employee-li-tpl").html());

  /* ---------------------------------- Local Variables ---------------------------------- */
  var adapter = new MemoryAdapter();
  adapter.initialize().done(function () {
    $('body').html(new HomeView(adapter, homeTpl, employeeLiTpl).render().el);
    console.log("Data adapter initialized");
  });

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

}());
