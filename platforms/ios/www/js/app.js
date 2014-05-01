// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

  var homeTpl = Handlebars.compile($("#home-tpl").html());
  var employeeLiTpl = Handlebars.compile($("#employee-li-tpl").html());

  /* ---------------------------------- Local Variables ---------------------------------- */
  var adapter = new MemoryAdapter();
  adapter.initialize().done(function () {
    console.log("Data adapter initialized");
    renderHomeView();
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


  /* ---------------------------------- Local Functions ---------------------------------- */
  function findByName() {
    adapter.findByName($('.search-key').val()).done(function (employees) {
        $('.employee-list').html(employeeLiTpl(employees));
    });
  }

  function renderHomeView() {
    $('body').html(homeTpl());
    $('.search-key').on('keyup', findByName);
  }

}());
