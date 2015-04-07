/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('ItemCtrl', function($scope) {
    // debugger;
    $scope.items = gon.items;
  }).filter('highlight', function($sce) {
  return function(text, phrase) {
    if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'), '<span class="highlighted">$1</span>')
    return $sce.trustAsHtml(text)
  }
});
}(GeoP));
