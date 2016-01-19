//= require active_admin/base
//= require jquery
//= require jquery.minicolors
//= require jquery.minicolors.simple_form

/*global jQuery*/
(function() {
  'use strict';

  function updateDisplayColors($) {
    $('.color-display').each(function(i, td) {
      /*jslint unparam:true*/
      var $td = $(td),
        bg;
      bg = $td.text();
      $td.css('background-color', bg);
    });
  }

  jQuery(function($) {
    // $('.colorpicker').minicolors();
    updateDisplayColors($);
    var $rl, $div, link;
    $rl = $('.room-link');
    $div = $('<div class="room-link-container"></div>');
    $rl.wrap($div);

    link = '/rooms/' + $rl.val();
    $('.room-link-container').html('<a href="' + link + '">Ouvrir</a>');
  });
}());
