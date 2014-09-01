/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    var i, floors, r, floorsArray, floorsMax, fId, buildings;
    geoP.handleKeyEventsForScope($scope);
    $scope.o = gon.organization;
    $scope.floors = [];
    floors = {};
    buildings = {};

    for (i = 0; i < $scope.o.rooms.length; i += 1) {
      r = $scope.o.rooms[i];

      // if (buildings[r.floor.building.id] === undefined) {
      //   buildings[r.floor.building.id] = {};
      // }

      floors[r.floor.id] = r.floor;
      // buildings[r.floor.building.id][r.floor.id] = r.floor;
    }

    function loadFloors(floorsArrayLocal) {
      function compare(a, b) {
        return a.level > b.level;
      }
      floorsArrayLocal = floorsArrayLocal.sort(compare);
      $scope.floors = floorsArrayLocal;
      $scope.mapMode = 'show';
      geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope, function(mapFilter) {
        $scope.filter = mapFilter.filters.organization[$scope.o.id];
        $scope.filter.state = true;
        $rootScope.$emit('organization_filters.StateChange', $scope.filter);
        $scope.$apply();
      });
    }

    floorsArray = [];
    floorsMax = Object.keys(floors).length;
    i = 0;

    function floorLoaded(res) {
      floorsArray.push(res);
      i += 1;
      if (i === floorsMax) {
        loadFloors(floorsArray);
      }
    }

    for (fId in floors) {
      if (floors.hasOwnProperty(fId)) {
        $http.get('/floors/' + fId + '/json').success(floorLoaded);
      }
    }
  });
}(GeoP));
