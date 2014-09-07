/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    GeoP.handleKeyEventsForScope($scope);
    $scope.building = gon.building;
    $scope.floors = $scope.building.floors;
    $scope.mapMode = 'show';

    geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope);

  });


}(GeoP));
