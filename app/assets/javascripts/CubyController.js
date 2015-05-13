/*global GeoP,gon*/
(function(geoP) {
  'use strict';

  geoP.app.controller('CubyController', function($scope, $http, $rootScope) {

    $scope.i18n = gon.i18n;
    geoP.handleTabHeaderClick($rootScope, $scope);

    $scope.floorsByBuildingId = {};
    $scope.loading = true;
    geoP.handleKeyEventsForScope($scope);

    $http.get(gon.building.url + '.json').success(function(b) {
      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;

      $rootScope.$emit('SetBodyColor', b);
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;

      geoP.setFloorsMaps(b.id, b.floors, $rootScope, $http);

      $scope.loading = false;
      var cuby = new GeoP.Cuby($rootScope, b);
      setTimeout(function() {

        cuby.initDomIsReady();

      }, 500);


    });


  });


}(GeoP));
