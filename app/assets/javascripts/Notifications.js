(function(geoP){

  var notificationManager = function(){
    var id = 0;

    function actionDone(message){
      var nId = 'notification-' + id;
      var n = ['<li class="done" id="', nId, '">', message,'</li>'].join('');
      var $n = $(n);
      $('#notifications').prepend($n);
      setTimeout(function(){
        $n.fadeOut(function(){
          $n.remove();
        })
      }, 1000);
    }
    return {
      done : actionDone
    };
  }

  geoP.notifications = notificationManager();

}(GeoP));