/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BuildingCtrl', function($scope, $http, $rootScope) {

    $scope.i18n = gon.i18n;
    geoP.handleTabHeaderClick($rootScope, $scope);

    $scope.floorsByBuildingId = {};
    $scope.loading = true;
    geoP.handleKeyEventsForScope($scope);

    $http.get(gon.building.url + '.json').success(function(b) {
      $scope.buildings = [b.id];
      $rootScope.buildings = $scope.buildings;

      $rootScope.$emit('SetBodyColor', b);
      $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;

      geoP.setFloorMaps(b.id, b.floors, $scope, $http, $rootScope);
      $scope.loading = false;
    });


    $scope.deleteBuilding = function(bId) {
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

    }

  });


}(GeoP));
