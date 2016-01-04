/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';


  function getNumberOfRooms(b) {
    if (b === undefined) {
      return 0;
    }
    return b.floors.reduce(function(a, b) {
      return a + b.rooms.length;
    }, 0);
  }

  function getNumberOfPeople(b) {
    return b.floors.map(function(f) {
      return f.rooms;
    }).reduce(function(a, b) {
      return a + b.reduce(function(c, d) {
        return c + d.affectations.length;
      }, 0);
    }, 0);
  }

  function getNumberOfFreeDesk(b) {
    return b.floors.map(function(f) {
      return geoP.countFreeDesksFromRooms(f.rooms);
    }).reduce(function(a, b) {
      return a + b;
    }, 0);
  }

  function getTotalArea(b) {
    var res = b.floors.map(function(f) {
      return f.rooms;
    }).reduce(function(a, b) {
      return a + b.reduce(function(c, d) {
        return c + d.area;
      }, 0);
    }, 0);
    return res.toFixed(2);
  }


  geoP.app.controller('BuildingController', function($scope, $http, $rootScope) {

    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    geoP.handleKeyEventsForScope($scope);

    $scope.room = null;

    geoP.registerEditorStopLoading($rootScope);
    geoP.editorDisplayNames($scope, $rootScope, gon.building.id);

    $scope.buildings = [gon.building.id];
    $rootScope.$emit('SetBodyColor', gon.building);

    $http.get(gon.building.url + '.json').success(function(b) {
      $rootScope.buildings = $scope.buildings;
      $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;
      geoP.setFloorsMaps(b.id, b.floors, $rootScope, $http);


      $scope.information = {
        numberOfRooms: getNumberOfRooms(b),
        numberOfPeople: getNumberOfPeople(b),
        numberOfFreeDesk: getNumberOfFreeDesk(b),
        totalArea: getTotalArea(b)
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
