/*global GeoP*/
(function(geoP) {
  'use strict';


  geoP.app.controller('FiltersController', function($scope, $rootScope) {
    $scope.f = $rootScope.f;
    $scope.filterNames = GeoP.filtersNames;

    $scope.filterPaneClick = function(filter, bId) {
      setTimeout(function() {
        $rootScope.mapFilter[bId].updateEditorsRoomPositions();
      }, 250);
    };

  });
}(GeoP));
