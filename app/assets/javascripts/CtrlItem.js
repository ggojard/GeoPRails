/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('ItemCtrl', function($scope) {
    // debugger;
    $scope.items = gon.items;

    $scope.inventoryByBuilding = {};
    $scope.buildingsById = {};
    $scope.totalByBuildingId = {};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

    for (var i = 0; i < gon.items.length; i++) {
      var item = gon.items[i];
      if (item.inventories && item.inventories) {
        for (var j = 0; j < item.inventories.length; j++) {
          var inventory = item.inventories[j];
          if (inventory.room && inventory.room.floor && inventory.room.floor.building) {
            var building = inventory.room.floor.building;
            if ($scope.inventoryByBuilding[building.id] === undefined){
              $scope.inventoryByBuilding[building.id] = [];
              $scope.buildingsById[building.id] = building;
              $scope.totalByBuildingId[building.id] = 0;
            }
            $scope.inventoryByBuilding[building.id].push(inventory);
            if (isNumber(inventory.quantity)){
              $scope.totalByBuildingId[building.id] += inventory.quantity;    
            }
            
          }
        }
      }
    }

    $scope.itemFilter = function(item) {
      return item.name.search(new RegExp($scope.query, "i")) !== -1 || item.code.search(new RegExp($scope.query, "i")) !== -1 || item.description.search(new RegExp($scope.query, "i")) !== -1;
    }

    $scope.a = function(items) {
      return items;
    }

  }).filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>')
      return $sce.trustAsHtml(text)
    }
  });
}(GeoP));
