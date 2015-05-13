/*global GeoP, gon, jQuery*/
(function(geoP, $) {
  'use strict';
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    var i, floors, r, floorsArray, floorsMax, fId, buildings, buildingId, floorId;
    geoP.handleKeyEventsForScope($scope);
    geoP.handleTabHeaderClick($rootScope, $scope);
    $scope.o = gon.organization;
    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    floors = {};
    buildings = {};

    for (i = 0; i < $scope.o.rooms.length; i += 1) {
      r = $scope.o.rooms[i];
      floorId = r.floor.id;
      buildingId = r.floor.building_id;
      // if (buildings[buildingId] === undefined) {
      //   buildings[buildingId] = [];
      // }
      // buildings[buildingId].push(floorId);
      floors[r.floor.id] = r.floor;
    }


    function loadFloors(floorsArrayLocal) {
      var buildingsById = {},
        floorsByBuildingId = {},
        bId;

      floorsArrayLocal.forEach(function(f) {
        buildingsById[f.building_id] = f.building;
        if (floorsByBuildingId[f.building_id] === undefined) {
          floorsByBuildingId[f.building_id] = [];
        }
        floorsByBuildingId[f.building_id].push(f);
      if (buildings[f.building_id] === undefined) {
        buildings[f.building_id] = [];
      }
      buildings[f.building_id].push(f.id);

      });

    $scope.buildings = Object.keys(buildings);
    $rootScope.buildings = $scope.buildings;

      Object.keys(buildings).forEach(function(bId) {
        floorsByBuildingId[bId].sort(function(a, b) {
          return a.level > b.level;
        });
      });

      $scope.buildingsById = buildingsById;
      $scope.floorsByBuildingId = floorsByBuildingId;

      $scope.mapMode = 'show';
      $scope.filter = {};

      function loadBuilding(localBuildingId) {
        var mapFilter, filter;
        $rootScope.$emit('SetBodyColor', buildingsById[localBuildingId]);
        geoP.setFloorsMaps(localBuildingId, $scope.floorsByBuildingId[localBuildingId], $rootScope, $http);
        mapFilter = $rootScope.mapFilter[localBuildingId];
        $scope.filter[localBuildingId] = mapFilter.mergedFiltersForBuildings[localBuildingId].organization[$scope.o.id];
        filter = mapFilter.bfilters[localBuildingId].belongsToItems.organization[$scope.o.id];
        filter.state = true;
        $rootScope.$emit('organization_filters.StateChange', filter);
      }

      for (bId in buildings) {
        if (buildings.hasOwnProperty(bId)) {
          loadBuilding(bId);
        }
      }

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

    $scope.init = function(bId) {
      setTimeout(function() {
        var $id;

        $id = $('#tab-oraganization-' + bId);

        $id.on('show.bs.tab', function() {
          $rootScope.roomInfoTopOffset = 0;
        });

        $id.on('shown.bs.tab', function() {
          var editors = $rootScope.mapFilterByBuildingId[bId].editors;
          editors.forEach(function(editor) {
            editor.mapOnItems('updateTextPosition');
          });
          geoP.selectPolylineIfIsInHash($scope);
        });
      }, 0);
    };
  });
}(GeoP, jQuery));
