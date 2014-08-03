(function(geoP) {

  var notificationManager = function() {
    var id = 0;


    function message(css, text) {
      var nId = 'notification-' + id;
      var n = ['<li class="', css, '" id="', nId, '">', text, '</li>'].join('');
      var $n = $(n);
      $('#notifications').prepend($n);
      setTimeout(function() {
        $n.fadeOut(function() {
          $n.remove();
        })
      }, 1000);
    }

    function done(text) {
      message('done', text);
    }

    function error(text) {
      message('error', text);
    }

    return {
      done: done,
      error: error
    };
  }

  geoP.notifications = notificationManager();

}(GeoP));