/*global GeoP, gon, jQuery*/
(function(geoP, $) {
  'use strict';


  function countFreeDesksFromOrganization(organization_id, floorsByBuildingId, building_id) {
    var res = 0;
    floorsByBuildingId[building_id].map(function(a) {
      var rooms = a.rooms.filter(function(r) {
        if (r.organization_id === organization_id) {
          return true;
        }
      });
      res += geoP.countFreeDesksFromRooms(rooms);
      return res;
    });
    return res;
  }

  function getOrganizationInformation(orgMapFilter, organization_id, localBuildingId, $scope) {
    return {
      numberOfRooms: orgMapFilter.count,
      totalArea: orgMapFilter.areaSum,
      numberOfPeople: orgMapFilter.nbPeople,
      ratio: orgMapFilter.ratio,
      available_on_number_of_floor: $scope.floorsByBuildingId[localBuildingId].length,
      numberOfFreeDesk: countFreeDesksFromOrganization(organization_id, $scope.floorsByBuildingId, localBuildingId)
    };
  }

  function loadBuilding(localBuildingId, buildingsById, $scope, $rootScope, $http) {
    var mapFilter, filter, orgMapFilter, indexOfBuilding;
    $rootScope.$emit('SetBodyColor', buildingsById[localBuildingId]);
    geoP.setFloorsMaps(localBuildingId, $scope.floorsByBuildingId[localBuildingId], $rootScope, $http);
    mapFilter = $rootScope.mapFilter[localBuildingId];
    if (mapFilter === undefined) {
      indexOfBuilding = $scope.buildings.indexOf(localBuildingId);
      $scope.buildings.splice(indexOfBuilding, 1);
      return false;
    }
    orgMapFilter = mapFilter.mergedFiltersForBuildings[localBuildingId][$scope.filterType][$scope.o.id];
    if (orgMapFilter === undefined) {
      // may be a parent organization
      orgMapFilter = geoP.MapFilterHelper.getInitKpi();
    }
    $scope.filter[localBuildingId] = orgMapFilter;
    $scope.information[localBuildingId] = getOrganizationInformation(orgMapFilter, $scope.o.id, localBuildingId, $scope);
    geoP.editorDisplayNames($scope, $rootScope, localBuildingId);

    $rootScope.$on('editor-loaded-' + localBuildingId, function(e, editor) {
      /*jslint unparam:true*/
      filter = mapFilter.bfilters[localBuildingId].belongsToItems[$scope.filterType][$scope.o.id];
      if (filter !== undefined) {
        filter.state = true;
        mapFilter.updateFilterStateAndContext($scope.filterType, filter);
      }
    });
  }

  geoP.app.controller('OrganizationController', function($scope, $http, $rootScope, $routeParams) {
    $rootScope.$emit('start-loading');

    $scope.$routeParams = $routeParams;
    $scope.menu = [
      geoP.getMenuItem('information', 'Information', 'organizations'),
      geoP.getMenuItem('filters', 'Filtres', 'floors'),
      geoP.chartMenuItem,
      geoP.getMenuItem('display_text', 'Afficher dans les pièces', 'floors'),
      geoP.getMenuItem('org_children', 'Services', 'organizations', {
        shouldDisplay: function() {
          return $scope.o !== undefined && $scope.o.organizations.length > 0;
        }
      })
    ];

    $scope.i18n = gon.i18n;


    $http.get('/organizations/' + $routeParams.organizationId + '.json').success(function(o) {

      var i, floors, r, floorsArray, floorsMax, fId, buildings, buildingsById = {},
        f;
      geoP.handleKeyEventsForScope($scope);
      $scope.o = o;
      $scope.floorsByBuildingId = {};
      $scope.information = {};
      floors = {};
      buildings = {};
      geoP.registerEditorStopLoading($rootScope);


      function loadRooms(rooms) {
        for (i = 0; i < rooms.length; i += 1) {
          r = rooms[i];
          floors[r.floor.id] = r.floor;
          f = r.floor;
          buildingsById[r.floor.building.id] = r.floor.building;
          if (buildings[f.building_id] === undefined) {
            buildings[f.building_id] = [];
          }
          buildings[f.building_id].push(f.id);
        }
      }

      loadRooms($scope.o.rooms);

      $scope.o.organizations.forEach(function(org) {
        loadRooms(org.rooms);
      });

      $scope.filterType = 'organization';
      if ($scope.o.organizations.length > 0) {
        $scope.filterType = 'direction';
      }

      $scope.buildingsById = buildingsById;
      $scope.buildings = Object.keys(buildings);

      function loadFloors(floorsArrayLocal) {
        var floorsByBuildingId = {},
          bId;

        if (floorsArrayLocal.length === 0) {
          $scope.noRoomsForOrganization = true;
          return false;
        }
        floorsArrayLocal.forEach(function(f) {
          buildingsById[f.building_id] = f.building;
          if (floorsByBuildingId[f.building_id] === undefined) {
            floorsByBuildingId[f.building_id] = [];
          }
          floorsByBuildingId[f.building_id].push(f);

        });
        Object.keys(buildings).forEach(function(bId) {
          if (floorsByBuildingId[bId] === undefined) {
            return false;
          }
          floorsByBuildingId[bId].sort(function(a, b) {
            return a.level > b.level;
          });
        });

        $scope.floorsByBuildingId = floorsByBuildingId;
        $scope.mapMode = 'show';
        $scope.filter = {};
        for (bId in buildings) {
          if (buildings.hasOwnProperty(bId)) {
            loadBuilding(bId, buildingsById, $scope, $rootScope, $http);
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

      $scope.onBuildingClick = function(bId) {
        if ($rootScope.mapFilterByBuildingId !== undefined && $rootScope.mapFilterByBuildingId[bId] !== undefined) {
          var editors = $rootScope.mapFilterByBuildingId[bId].editors;
          editors.forEach(function(editor) {
            editor.mapOnItems('updateTextPosition');
          });
          geoP.selectPolylineIfIsInRouteParams($scope, bId);
        }
      };
    });


  });
}(GeoP, jQuery));
