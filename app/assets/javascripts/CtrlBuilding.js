(function(geoP) {

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    GeoP.handleKeyEventsForScope($scope);
    $scope.building = gon.building;
    $scope.floors = $scope.building.floors;
    $scope.G_Mode = 'show';

    geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope);

  });


}(GeoP))