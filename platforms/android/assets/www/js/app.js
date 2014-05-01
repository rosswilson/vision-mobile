// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

  // Render the handlebar templates
  var employeeTpl = Handlebars.compile($("#employee-tpl").html());

  /* ---------------------------------- Local Variables ---------------------------------- */
  var adapter = new MemoryAdapter();

  var detailsURL = /^#employees\/(\d{1,})/;

  var slider = new PageSlider($('body'));

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

  adapter.initialize().done(function () {
    route();
    console.log("Data adapter initialized");
  });

  /* --------------------------------- Local Functions ----------------------------------- */
  function route() {
    var hash = window.location.hash;
    if (!hash) {
      // slider.slidePage(new HomeView(adapter).render().el);
      slider.slidePage(new WhatsOnView().render().el);
      return;
    }
    var match = hash.match(detailsURL);
    if (match) {
      adapter.findById(Number(match[1])).done(function(employee) {
        slider.slidePage(new EmployeeView(adapter, employeeTpl, employee).render().el);
      });
    }
  }

}());
