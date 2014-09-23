/*global GeoP:true, google:true*/
(function(geoP) {
  'use strict';

  google.load('visualization', '1.0', {
    packages: ['corechart']
  });

  geoP.app.controller('ChartsCtrl', function($scope, $http, $rootScope) {
    /*jslint unparam: true*/

    var chartsData = {},
      filterMethod;

    filterMethod = function(fName, filter, filterNames, bId) {
      $scope.chart = null;
      $rootScope.$on(fName + '_' + bId + '_filters.Selected', function() {
        chartsData[bId][fName]();
      });

      if (chartsData[bId] === undefined) {
        chartsData[bId] = {};
      }

      chartsData[bId][fName] = function() {
        var data, itemId, item, a, options, chart, itemName;
        data = [
          [fName, 'Surface (m²)', {
            role: 'style'
          }]
        ];
        for (itemId in filter) {
          if (filter.hasOwnProperty(itemId)) {
            item = filter[itemId];
            itemName = filterNames[fName][itemId];
            data.push([itemName.name, item.areaSum, itemName.color]);
          }
        }

        if (data.length > 1) {
          a = google.visualization.arrayToDataTable(data);
          options = {};
          chart = new google.visualization.ColumnChart(document.getElementById('chart_div_' + bId));
          chart.draw(a, options);
          $scope.chart = chart;
        }
      };
    };
    $rootScope.$on('MapFilter.Ready', function(mapFilter) {
      var filters, filterName, f, filterNames, bId;
      if ($rootScope.mapFilter !== undefined) {

        bId = $rootScope.mapFilter.buildingId;
        filters = $rootScope.mapFilter.mergedFiltersForBuildings[bId];
        filterNames = $rootScope.mapFilter.bfilters[bId].belongsToItems;
        for (filterName in filters) {
          if (filters.hasOwnProperty(filterName)) {
            f = filters[filterName];
            (filterMethod(filterName, f, filterNames, bId));
          }
        }
        chartsData[bId][geoP.filtersNames[0].name]();
      }
    });
  });
}(GeoP));
