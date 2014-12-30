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
      $rootScope.$on(fName + '_' + bId + '_charts.Selected', function() {
        chartsData[bId][fName]();
        $rootScope.mapFilter.updateEditorsRoomPositions();        
      });
      $rootScope.$on('Refresh.CurrentChart', function(e, buildingId) {
        var c = $rootScope.currentChart[buildingId];        
        c.$element.show();
        c.chart.draw(c.a, c.options);
      });

      // $rootScope.currentChart

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
          var e = document.getElementById('chart_div_' + bId);
          chart = new google.visualization.ColumnChart(e);
          chart.draw(a, options);
          $scope.chart = chart;

          if ($rootScope.currentChart === undefined){
            $rootScope.currentChart = {};
          }
          $rootScope.currentChart[bId] = {a:a, options:options, chart:chart, $element : $(e)};
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
