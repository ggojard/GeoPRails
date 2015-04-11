/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('ItemCtrl', function($scope) {
    // debugger;
    $scope.items = gon.items;

    $scope.itemFilter = function(item) {
      return item.name.search(new RegExp($scope.query, "i")) !== -1 
      || item.code.search(new RegExp($scope.query, "i")) !== -1
      || item.description.search(new RegExp($scope.query, "i")) !== -1;
    }

  }).filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>')
      return $sce.trustAsHtml(text)
    }
  });
}(GeoP));
