(function(geoP) {

  geoP.app.controller('BuildingCtrl', function($scope) {
    $scope.building = G_BuildingJson;

    $scope.floors = $scope.building.floors;

  });


}(GeoP))