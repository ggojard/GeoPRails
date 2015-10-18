/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    geoP.handleKeyEventsForScope($scope);

    $rootScope.room = null;
    $rootScope.roomInfoTopOffset = 0;

    geoP.registerEditorStopLoading($rootScope);

    $http.get(gon.building.url + '.json').success(function(b) {
      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;
      $rootScope.$emit('SetBodyColor', b);
      $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;
      geoP.setFloorsMaps(b.id, b.floors, $rootScope, $http);


      $scope.getNumberOfRooms = function() {
        return b.floors.reduce(function(a, b) {
          return a + b.rooms.length;
        }, 0);
      };

      $scope.getNumberOfPeople = function() {
        return b.floors.map(function(f) {
          return f.rooms;
        }).reduce(function(a, b) {
          return a + b.reduce(function(c, d) {
            return c + d.affectations.length;
          }, 0);
        }, 0);
      };

      $scope.getNumberOfFreeDesk = function() {
        return b.floors.map(function(f) {
          return geoP.countPeopleFromRooms(f.rooms);
        }).reduce(function(a, b) {
          return a + b;
        }, 0);
      };

      $scope.getTotalArea = function() {
        return b.floors.map(function(f) {
          return f.rooms;
        }).reduce(function(a, b) {
          return a + b.reduce(function(c, d) {
            return c + d.area;
          }, 0);
        }, 0);
      };


    });



    $scope.deleteBuilding = function() {
      $rootScope.$emit('RightPopupShow', 'Supprimer le Bâtiment ' + $scope.building.name, 'L\'ensemble des étages et pièces associés à ce bâtiment seront supprimés sans possibilité de retour en arrière.', [{
        'label': 'Confirmer',
        classes: 'btn-success',
        icon: 'fa-trash-o',
        action: function(callback) {
          $http.get(gon.building.url + '/delete_all').success(function(res) {
            if (res.status === 'OK') {
              geoP.notifications.done('La bâtiment a été supprimé.');
              window.location.href = '/';
              return callback(res);
            }
          });
        }
      }]);

    };

  });


}(GeoP));
