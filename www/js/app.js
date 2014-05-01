// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
(function () {

  FastClick.attach(document.body);

  /* ---------------------------------- Local Variables ---------------------------------- */
  var adapter = new MemoryAdapter();
  adapter.initialize().done(function () {
    console.log("Data adapter initialized");
  });

  /* --------------------------------- Event Registration -------------------------------- */
  $('.search-key').on('keyup', findByName);
  $('.help-btn').on('click', function() {
    alert("Some help here...")
  });

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
      var l = employees.length;
      var e;
      $('.employee-list').empty();
      for (var i = 0; i < l; i++) {
        e = employees[i];
        $('.employee-list').append('<li><a href="#employees/' + e.id + '">' + e.firstName + ' ' + e.lastName + '</a></li>');
      }
    });
  }

}());
