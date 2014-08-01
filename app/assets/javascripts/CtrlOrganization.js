(function(geoP) {
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    $scope.o = G_Organization;
    $scope.floors = [];
    var floors = {};


    for (var i = 0; i < $scope.o.rooms.length; i++) {
      var r = $scope.o.rooms[i];
      // console.log(r);
      floors[r.floor.id] = r.floor;
    }

    // console.log(floors);


    function loadFloors(floorsArray){
      $scope.floors = floorsArray;
      $scope.G_Mode = 'show';
      geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope);
      // $rootScope.emit('')
      // $rootScope.$emit('organization_filters.StateChange', filter);
    }

    floorsArray = [];
    var floorsMax = Object.keys(floors).length;
    var i = 0;
    for (var fId in floors) {
      if (floors.hasOwnProperty(fId)) {
        var floor = floors[fId];
        $http.get('/floors/' + fId + '/json').success(function(res){
          floorsArray.push(res);
          console.log(res);
          i += 1;
          if (i === floorsMax){
            loadFloors(floorsArray);
          }
        });
      }
    }

    console.log($scope.floors);


  });
}(GeoP))



//