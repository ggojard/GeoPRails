/*global GeoP:true, google:true*/
(function(geoP) {
  'use strict';

  google.load('visualization', '1.0', {
    packages: ['corechart']
  });

  geoP.app.controller('ChartsCtrl', function($scope, $http, $rootScope) {
    /*jslint unparam: true*/

    // google.setOnLoadCallback(drawChart);
    var chartsData = {},
      filterMethod;

    filterMethod = function(fName, filter) {
      $scope.chart = null;
      $rootScope.$on(fName + '_filters.Selected', function() {
        chartsData[fName]();
      });

      chartsData[fName] = function() {
        var data, itemId, item, a, options, chart;
        data = [
          // 'Nombre de pièces', 'Nombre de personnes',
          [fName, 'Surface (m²)', {
            role: 'style'
          }]
        ];
        for (itemId in filter) {
          if (filter.hasOwnProperty(itemId)) {
            item = filter[itemId];
            // item.count, item.nbPeople,
            data.push([item.name, item.areaSum, item.color]);
          }
        }

        if (data.length > 1) {
          a = google.visualization.arrayToDataTable(data);
          options = {};
          chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
          chart.draw(a, options);
          $scope.chart = chart;
        }
      };
    };
    $rootScope.$on('MapFilter.Ready', function(mapFilter) {
      var filters, filterName, f;
      if ($rootScope.mapFilter !== undefined) {
        filters = $rootScope.mapFilter.filters;
        for (filterName in filters) {
          if (filters.hasOwnProperty(filterName)) {
            f = filters[filterName];
            (filterMethod(filterName, f));
          }
        }
        chartsData[geoP.filtersNames[0].name]();
      }
    });
  });
}(GeoP));
