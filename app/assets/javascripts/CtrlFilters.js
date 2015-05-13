/*global GeoP*/
(function(geoP) {
  'use strict';


  geoP.app.controller('FiltersCtrl', function($scope, $rootScope) {
    $scope.f = $rootScope.f;
    $scope.filterNames = GeoP.filtersNames;

    console.log('start filter', $rootScope.f);

    $scope.initFilter = function() {
      console.log('init filter');
    };

    $scope.filterPaneClick = function(filter, bId) {
      setTimeout(function() {
        $rootScope.mapFilter[bId].updateEditorsRoomPositions();
      }, 250);
    };

  });
}(GeoP));
