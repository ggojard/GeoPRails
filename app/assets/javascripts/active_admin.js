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
});

