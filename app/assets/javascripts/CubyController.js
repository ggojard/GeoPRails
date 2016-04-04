/*global GeoP,gon*/
(function(geoP) {
  'use strict';

  geoP.app.controller('CubyController', function($scope, $http, $rootScope, $routeParams) {
    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    geoP.handleKeyEventsForScope($scope);
    $rootScope.$emit('start-loading');



    $http.get('/buildings/' + $routeParams.buildingId + '.json').success(function(b) {
      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;
      $rootScope.$emit('SetBodyColor', b);
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;
      geoP.setFloorsMaps(b.id, b.floors, $rootScope, $http);
      var cuby = new GeoP.Cuby($rootScope, b);
      setTimeout(function() {
        cuby.initDomIsReady();
        $rootScope.$emit('stop-loading');
      }, 500);
    });
  });
}(GeoP));
