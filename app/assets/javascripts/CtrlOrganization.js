/*global GeoP, gon, jQuery*/
(function(geoP, $) {
  'use strict';
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    var i, floors, r, floorsArray, floorsMax, fId, buildings;
    geoP.handleKeyEventsForScope($scope);
    $scope.o = gon.organization;
    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    floors = {};
    buildings = {};
    geoP.registerEditorStopLoading($rootScope);

    for (i = 0; i < $scope.o.rooms.length; i += 1) {
      r = $scope.o.rooms[i];
      floors[r.floor.id] = r.floor;
    }


    $rootScope.$on('stop-loading', function() {

      // update the text positions
      setTimeout(function() {
        if (Object.keys(buildings).length > 0) {
          var bId = Object.keys(buildings)[0],
            j;
          if ($rootScope.mapFilterByBuildingId[bId].editors.length > 0) {
            for (j = 0; j < $rootScope.mapFilterByBuildingId[bId].editors.length; j += 1) {
              $rootScope.mapFilterByBuildingId[bId].editors[j].mapOnItems('updateTextPosition');
            }
          }
        }
      }, 250);
    });


    function loadFloors(floorsArrayLocal) {
      var buildingsById = {},
        floorsByBuildingId = {},
        bId;

      if (floorsArrayLocal.length === 0) {
        // $rootScope.$emit('stop-loading');
        $scope.noRoomsForOrganization = true;
        return false;
      }

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

        $rootScope.$on('editor-loaded', function(e, editor) {
          /*jslint unparam:true*/
          if (editor.json.building_id === parseInt(localBuildingId, 10)) {
            filter = mapFilter.bfilters[localBuildingId].belongsToItems.organization[$scope.o.id];
            filter.state = true;
            $rootScope.f[localBuildingId].organization.filters.names[filter.id].state = true;
            editor.mapOnItems('fillFromFilterColor', 'organization');
          }
        });

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
      if (res !== null) {
        floorsArray.push(res);
      }
      i += 1;
      if (i === floorsMax) {
        loadFloors(floorsArray);
      }
    }

    function errorOnLoadingFloor() {
      console.error('error getting floor, it will be escape');
      floorLoaded(null);
    }

    for (fId in floors) {
      if (floors.hasOwnProperty(fId)) {
        $http.get('/floors/' + fId + '.json').success(floorLoaded).error(errorOnLoadingFloor);
      }
    }

    if (floorsMax === 0) {
      $rootScope.$emit('stop-loading');
      $scope.noRoomsForOrganization = true;
    }

    $scope.countPeopleFromOrganization = function(building_id) {
      var res = 0;
      $scope.floorsByBuildingId[building_id].map(function(a) {
        var rooms = a.rooms.filter(function(r) {
          if (r.organization_id === $scope.o.id) {
            return true;
          }
        });
        res += geoP.countPeopleFromRooms(rooms);
        return res;
      });
      return res;
    };

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
          geoP.selectPolylineIfIsInHash($scope, bId);
        });
      }, 0);
    };
  });
}(GeoP, jQuery));
