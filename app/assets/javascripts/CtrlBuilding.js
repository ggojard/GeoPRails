/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    $scope.loading = true;
    GeoP.handleKeyEventsForScope($scope);

    $http.get(gon.building.url + '.json').success(function(b) {
      $scope.mapMode = 'show';
      $scope.loading = false;
      $scope.building = b;
      $scope.floors = b.floors;
      geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope);
    });



  });


}(GeoP));
