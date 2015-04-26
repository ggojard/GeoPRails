/*global GeoP,gon*/
(function(geoP) {
  'use strict';

  geoP.app.controller('CubyController', function($scope, $http, $rootScope) {

    $scope.svgEditors = {};

    $scope.i18n = gon.i18n;
    geoP.handleTabHeaderClick($rootScope, $scope);

    $scope.floorsByBuildingId = {};
    $scope.loading = true;
    geoP.handleKeyEventsForScope($scope);

    $http.get(gon.building.url + '.json').success(function(b) {


      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;

      $rootScope.$emit('SetBodyColor', b);
      // $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;

      geoP.setFloorMaps(b.id, b.floors, $scope, $http, $rootScope);

      var cuby = new Cuby($rootScope, b);      
      // cuby.animate();

      

      // geoP.setFloorMaps(b.id, b.floors, $scope, $http, $rootScope);
      $scope.loading = false;
    });


  });


}(GeoP));
