/*global GeoP, gon, moment*/
(function(geoP) {
  'use strict';

  geoP.app.controller('ItemController', function($scope, $rootScope, $http) {
    $http.get('/items.json').success(function(items) {
      $scope.items = items;
      $rootScope.$emit('stop-loading');
    });
  });


  geoP.app.controller('ItemSingleController', function($scope, $rootScope, $routeParams, $http) {

    $scope.i18n = gon.i18n;
    $scope.items = gon.items;
    $scope.inventoryByBuilding = {};
    $scope.buildingsById = {};
    $scope.totalByBuildingId = {};

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    $http.get('/items/' + $routeParams.itemId + '.json').success(function(item) {
      var i, j, items, inventory, building;
      items = [item];
      $scope.items = items;
      for (i = 0; i < items.length; i += 1) {
        item = items[i];
        if (item.inventories) {
          for (j = 0; j < item.inventories.length; j += 1) {
            inventory = item.inventories[j];
            if (inventory.room && inventory.room.floor && inventory.room.floor.building) {
              building = inventory.room.floor.building;
              if ($scope.inventoryByBuilding[building.id] === undefined) {
                $scope.inventoryByBuilding[building.id] = [];
                $scope.buildingsById[building.id] = building;
                $scope.totalByBuildingId[building.id] = 0;
              }
              $scope.inventoryByBuilding[building.id].push(inventory);
              if (isNumber(inventory.quantity)) {
                $scope.totalByBuildingId[building.id] += inventory.quantity;
              }
            }
          }
        }
      }
      $rootScope.$emit('stop-loading');
    });

    $scope.formatDate = function(d) {
      if (d !== undefined && d !== null) {
        return moment(d).format('Do MMMM YYYY');
      }
      return '';
    };
    $scope.itemFilter = function(item) {
      return item.name.search(new RegExp($scope.query, 'i')) !== -1 || item.code.search(new RegExp($scope.query, 'i')) !== -1 || item.description.search(new RegExp($scope.query, 'i')) !== -1;
    };
    $scope.a = function(items) {
      return items;
    };


  }).filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) {
        text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
      }
      return $sce.trustAsHtml(text);
    };
  });


}(GeoP));
