//= require active_admin/base
//= require jquery
//= require jquery.minicolors
jQuery( function($) {
    $(".colorpicker").minicolors()
    $('.color-display').each(function(i, td){
      var $td = $(td), bg;
      bg = $td.text();
      $td.css('background-color', bg);
    });
    var $rl = $('.room-link');
    var $div = $('<div class="room-link-container"></div>');
    $rl.wrap($div);

    // console.log($rl.val());
    var link = '/rooms/' + $rl.val();
    $('.room-link-container').html('<a href="' + link + '">Lien</a>');
});

