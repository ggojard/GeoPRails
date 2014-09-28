/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    $scope.floorsByBuildingId = {};
    $scope.loading = true;
    GeoP.handleKeyEventsForScope($scope);

    $http.get(gon.building.url + '.json').success(function(b) {
      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;

      $rootScope.$emit('SetBodyColor', b);
      $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;

      geoP.setFloorMaps(b.id, b.floors, $scope, $http, $rootScope);
      $scope.loading = false;
    });

  });


}(GeoP));
