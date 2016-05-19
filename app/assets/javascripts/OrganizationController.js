/*global GeoP, gon*/
(function (geoP) {
  'use strict';

  function loadBuilding(localBuildingId, buildingsById, $scope, $rootScope, $http) {
    var mapFilter, orgMapFilter, indexOfBuilding;
    // $rootScope.$emit('SetBodyColor', buildingsById[localBuildingId]);
    // geoP.setFloorsMaps(localBuildingId, $scope.floorsByBuildingId[localBuildingId], $rootScope, $http);
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
    geoP.editorDisplayNames($scope, $rootScope, localBuildingId);

    $rootScope.$on('editor-loaded-' + localBuildingId, function (e, editor) {
      /*jslint unparam:true*/
      mapFilter.clickOnFilter($scope.filterType, $scope.o.id);
    });
  }

  geoP.app.controller('OrganizationController', function ($scope, $http, $rootScope, $routeParams) {
    $rootScope.$emit('start-loading');
    $scope.i18n = gon.i18n;
    $scope.$routeParams = $routeParams;

    $scope.menu = [
      geoP.getMenuItem('information', 'organizations'),
      geoP.getMenuItem('filters', 'floors'),
      geoP.chartMenuItem,
      geoP.getMenuItem('display_text', 'floors'),
      geoP.getMenuItem('org_children', 'organizations', {
        shouldDisplay: function () {
          return $scope.o !== undefined && $scope.o.organizations.length > 0;
        }
      })
    ];

    $http.get('/organizations/' + $routeParams.organizationId + '.json').success(function (o) {

      var i, floors, floorsArray, floorsMax, buildings;
      geoP.handleKeyEventsForScope($scope);
      $scope.o = o;
      // $scope.floorsByBuildingId = o.data.buildings;
      $scope.information = o.information;
      floors = o.data.all_floors;
      buildings = {};
      geoP.registerEditorStopLoading($rootScope);

      // set the filters
      $scope.filters = {};
      $scope.mapMode = 'show';
      // $scope.filters[floor.building_id] = floor.filters;
      // $rootScope.mapFilter[floor.building_id].filters = floor.filters;
      // $rootScope.mapFilter[floor.building_id].mergedFiltersForBuildings[floor.building_id] = floor.filters;
      // $rootScope.mapFilter[floor.building_id].ready();


      // function loadRooms(rooms) {
      //   for (i = 0; i < rooms.length; i += 1) {
      //     r = rooms[i];
      //     floors[r.floor.id] = r.floor;
      //     f = r.floor;
      //     // buildingsById[r.floor.building.id] = r.floor.building;
      //     if (buildings[f.building_id] === undefined) {
      //       buildings[f.building_id] = [];
      //     }
      //     buildings[f.building_id].push(f.id);
      //   }
      // }

      // loadRooms($scope.o.rooms);

      // $scope.o.organizations.forEach(function (org) {
      //   loadRooms(org.rooms);
      // });

      $scope.filterType = 'organization';
      if ($scope.o.organizations.length > 0) {
        $scope.filterType = 'direction';
      }

      // $scope.buildingsById = buildingsById;
      $scope.buildings = Object.keys(o.data.buildings);

      function loadFloors(floorsArrayLocal) {
        var bId;

        if (floorsArrayLocal.length === 0) {
          $scope.noRoomsForOrganization = true;
          return false;
        }
        // floorsArrayLocal.forEach(function (f) {
        //   // buildingsById[f.building_id] = f.building;
        //   if (floorsByBuildingId[f.building_id] === undefined) {
        //     floorsByBuildingId[f.building_id] = [];
        //   }
        //   floorsByBuildingId[f.building_id].push(f);

        // });
        // Object.keys(buildings).forEach(function (bId) {
        //   if (floorsByBuildingId[bId] === undefined) {
        //     return false;
        //   }
        //   floorsByBuildingId[bId].sort(function (a, b) {
        //     return a.level > b.level;
        //   });
        // });

        // $scope.floorsByBuildingId = floorsByBuildingId;
        $scope.mapMode = 'show';
        $scope.filter = {};
        for (bId in buildings) {
          if (buildings.hasOwnProperty(bId)) {
            loadBuilding(bId, null, $scope, $rootScope, $http);
          }
        }
      }

      floorsArray = [];
      floorsMax = floors.length;
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

      floors.forEach(function (fId) {
        $http.get('/floors/' + fId + '.json').success(floorLoaded).error(errorOnLoadingFloor);
      });

      if (floorsMax === 0) {
        $rootScope.$emit('stop-loading');
        $scope.noRoomsForOrganization = true;
      }

      $scope.onBuildingClick = function (bId) {
        if ($rootScope.mapFilterByBuildingId !== undefined && $rootScope.mapFilterByBuildingId[bId] !== undefined) {
          var editors = $rootScope.mapFilterByBuildingId[bId].editors;
          editors.forEach(function (editor) {
            editor.mapOnItems('updateTextPosition');
          });
          geoP.selectPolylineIfIsInRouteParams($scope, bId);
        }
      };
    });

  });
}(GeoP));