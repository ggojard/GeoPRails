/*global GeoP, gon*/
(function (geoP) {
  'use strict';

  geoP.app.controller('BuildingController', function ($scope, $http, $rootScope, $routeParams, $location) {
    $rootScope.$emit('start-loading');

    var bId = $routeParams.buildingId;
    $scope.$routeParams = $routeParams;

    $scope.i18n = gon.i18n;
    $scope.floorsByBuildingId = {};
    geoP.handleKeyEventsForScope($scope);

    $scope.room = null;

    geoP.registerEditorStopLoading($rootScope);
    geoP.editorDisplayNames($scope, $rootScope, bId);

    $scope.buildings = [bId];

    $scope.menu = [
      geoP.getMenuItem('information', 'floors'),
      geoP.getMenuItem('display_floors', 'buildings'),
      geoP.getMenuItem('filters', 'floors'),
      geoP.chartMenuItem,
      geoP.getMenuItem('display_text', 'floors')
    ];

    $http.get('/buildings/' + bId + '.json').success(function (b) {
      $rootScope.$emit('SetBodyColor', b);
      $scope.mapMode = 'show';
      $scope.building = b;
      $scope.floorsByBuildingId[b.id] = b.floors;
      geoP.setFloorsMaps(b.id, b.floors, $rootScope, $http);

      if (b.floors.length === 0) {
        $rootScope.$emit('stop-loading');
      }

      $scope.information = {};
      $scope.information[b.id] = b.information;

      // set the filters
      $scope.filters = {};
      $scope.filters[b.id] = b.filters;
      $rootScope.mapFilter[b.id].filters = b.filters;
      $rootScope.mapFilter[b.id].mergedFiltersForBuildings[b.id] = b.filters;
      $rootScope.mapFilter[b.id].ready();

    });

    $scope.deleteBuilding = function () {
      $rootScope.$emit('RightPopupShow', 'Supprimer le Bâtiment ' + $scope.building.name, 'L\'ensemble des étages et pièces associés à ce bâtiment seront supprimés sans possibilité de retour en arrière.', [{
        'label': 'Confirmer',
        classes: 'btn-success',
        icon: 'fa-trash-o',
        action: function (callback) {
          $rootScope.$emit('start-loading');
          var url = '/buildings/' + $scope.building.id + '/delete_all';
          $http.get(url).success(function (res) {
            if (res.status === 'OK') {
              geoP.notifications.done('La bâtiment a été supprimé.');
              $rootScope.$emit('stop-loading');
              $location.path('/');
              return callback(res);
            }
          });
        }
      }]);
    };

  });


}(GeoP));