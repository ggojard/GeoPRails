/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    var i, floors, r, floorsArray, floorsMax, fId, buildings, buildingId, floorId;
    geoP.handleKeyEventsForScope($scope);
    $scope.o = gon.organization;
    $scope.floors = [];
    floors = {};
    buildings = {};

    for (i = 0; i < $scope.o.rooms.length; i += 1) {
      r = $scope.o.rooms[i];
      floorId = r.floor.id;
      buildingId = r.floor.building_id;

      if (buildings[buildingId] === undefined) {
        buildings[buildingId] = [];
      }
      buildings[buildingId].push(floorId);
      floors[r.floor.id] = r.floor;
    }

    function loadFloors(floorsArrayLocal) {
      $scope.floors = floorsArrayLocal;
      $scope.mapMode = 'show';
      geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope, function(mapFilter) {
        var bId;
        $scope.filter = {};
        for (bId in buildings) {
          if (buildings.hasOwnProperty(bId)) {
            $scope.filter[bId] = mapFilter.mergedFiltersForBuildings[bId].organization[$scope.o.id];
            $scope.filter[bId].state = true;
            $rootScope.$emit('organization_filters.StateChange', $scope.filter[bId]);
            $scope.$apply();
          }
        }

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
        $http.get('/floors/' + fId + '.json').success(floorLoaded);
      }
    }
  });
}(GeoP));
