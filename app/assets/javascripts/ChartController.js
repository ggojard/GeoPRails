/*global GeoP, google, $, angular, gon*/
(function (geoP) {
  'use strict';
  if (typeof google !== 'undefined') {
    google.load('visualization', '1.0', {
      packages: ['corechart']
    });
  }

  var chartsData = {},
    currentCharts = {},
    filterMethod;

  function setupChartsLoadMethods($rootScope, element) {
    if ($rootScope.mapFilter !== undefined) {
      var buildingsId, i, bId, mapFilter, filters, filterName, f;
      buildingsId = Object.keys($rootScope.mapFilter);
      for (i = 0; i < buildingsId.length; i += 1) {
        bId = buildingsId[i];
        mapFilter = $rootScope.mapFilter[bId];
        if (mapFilter !== undefined) {
          bId = mapFilter.buildingId;
          filters = mapFilter.mergedFiltersForBuildings[bId];
          for (filterName in filters) {
            if (filters.hasOwnProperty(filterName)) {
              f = filters[filterName];
              (filterMethod(filterName, f, bId, element));
            }
          }
          chartsData[bId][geoP.filtersNames[0].name](element);
        }
      }
    }
  }

  geoP.refreshCurrentChart = function (bId, $rootScope) {
    /*jslint browser:true*/
    setupChartsLoadMethods($rootScope, document.getElementById('chart_div_' + bId));
    if ($rootScope.currentCharts !== undefined) {
      var chartElement, c;
      chartElement = document.getElementById('chart_div_' + bId);
      angular.element(chartElement).css('display', 'none');
      c = $rootScope.currentCharts[bId];
      if (c !== undefined) {
        geoP.createColumnChart(bId, chartElement, c.data);
      }
    }
  };

  geoP.createColumnChart = function (bId, element, data) {
    var a, options, chart;
    if (typeof google === 'undefined') {
      return;
    }
    a = google.visualization.arrayToDataTable(data);
    options = {
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true
      }
    };
    if (element === null) {
      return;
    }
    angular.element(element).css('display', 'block');
    chart = new google.visualization.ColumnChart(element);
    chart.draw(a, options);
    currentCharts[bId] = {
      a: a,
      options: options,
      chart: chart,
      data: data
    };
  };

  filterMethod = function (fName, filter, bId) {
    if (chartsData[bId] === undefined) {
      chartsData[bId] = {};
    }
    if (chartsData[bId[fName]] !== undefined) {
      return false;
    }
    chartsData[bId][fName] = function (element) {
      var data, itemId, item, itemName;
      data = [
        [fName, gon.i18n.ui.information.total_area + ' (m²)', {
          role: 'style'
        }]
      ];
      for (itemId in filter) {
        if (filter.hasOwnProperty(itemId)) {
          item = filter[itemId];
          itemName = gon.references[fName][itemId];
          if (itemName !== undefined) {
            data.push([itemName.name, item.areaSum, itemName.color]);
          }
        }
      }
      if (data.length > 1) {
        geoP.createColumnChart(bId, element, data);
      }
    };
  };

  geoP.app.controller('ChartController', function ($scope, $rootScope) {
    $rootScope.currentCharts = currentCharts;
    $scope.filterNames = geoP.filtersNames;
    $scope.chartPaneClick = function (filter, bId) {
      var e, c;
      e = document.getElementById('chart_div_' + bId);
      chartsData[bId][filter.name](e);
      c = currentCharts[bId];
      if (c !== undefined) {
        c.chart.draw(c.a, c.options);
      }
    };
  });
}(GeoP));