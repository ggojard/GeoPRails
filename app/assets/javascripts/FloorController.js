/*global GeoP, gon*/

(function(geoP) {
  'use strict';

  function countPeopleFromRooms(rooms) {
    return rooms && rooms.reduce(function(a, b) {
      return a + b.affectations.length;
    }, 0);
  }

  function countFreeSpacesFromRooms(rooms) {
    return geoP.countFreeDesksFromRooms(rooms);
  }

  geoP.app.controller('FloorController', function($scope, $http, $rootScope, $routeParams) {
    $scope.floorsByBuildingId = {};
    $scope.mapMode = gon.mode;
    $scope.i18n = gon.i18n;
    geoP.registerEditorStopLoading($rootScope);


    $scope.menu = [
      geoP.getMenuItem('information', 'Information', 'floors'),
      // geoP.getMenuItem('display_floors', 'Accès direct aux étages', 'buildings'),
      geoP.getMenuItem('filters', 'Filtres', 'floors'),
      geoP.getMenuItem('charts', 'Rapports', 'floors'),
      geoP.getMenuItem('display_text', 'Afficher dans les pièces', 'floors')
    ];



    $http.get('/floors/' + $routeParams.floorId + '.json').success(function(floor) {
      $rootScope.$emit('SetBodyColor', floor.building);
      $scope.room = null;
      $scope.roomId = geoP.getRoomIdFromHash();
      $scope.buildings = [floor.building_id];
      $rootScope.buildings = $scope.buildings;
      $scope.buildingId = floor.building_id;
      $scope.floorsByBuildingId[floor.building_id] = [floor];
      geoP.editorDisplayNames($scope, $rootScope, floor.building_id);
      geoP.handleKeyEventsForScope($scope);
      $scope.floorJson = floor;

      $scope.information = {
        numberOfRooms: floor.rooms.length,
        numberOfPeople: countPeopleFromRooms(floor.rooms),
        numberOfFreeDesk: countFreeSpacesFromRooms(floor.rooms),
        totalArea: geoP.getTotalArea(floor.rooms)
      };
      geoP.setFloorsMaps(floor.building_id, $scope.floorsByBuildingId[floor.building_id], $rootScope, $http);
    });



  });
}(GeoP));
