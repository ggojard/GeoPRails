/*global GeoP, google, $, angular*/
(function(geoP) {
  'use strict';
  google.load('visualization', '1.0', {
    packages: ['corechart']
  });

  var chartsData = {},
    currentCharts = {},
    filterMethod;

  geoP.chartsData = chartsData;


  geoP.refreshCurrentChart = function(bId, $rootScope) {
    var chartElement, c;
    chartElement = document.getElementById('chart_div_' + bId);
    angular.element(chartElement).css('display', 'none');
    c = $rootScope.currentCharts[bId];
    geoP.createColumnChart(bId, chartElement, c.data);
  };

  geoP.createColumnChart = function(bId, element, data) {
    var a, options, chart;
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

  filterMethod = function(fName, filter, filterNames, bId) {
    if (chartsData[bId] === undefined) {
      chartsData[bId] = {};
    }
    chartsData[bId][fName] = function(element) {
      var data, itemId, item, itemName;
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
        geoP.createColumnChart(bId, element, data);
      }
    };
  };

  function setupChartsLoadMethods($rootScope, element) {
    var buildingsId, i, bId, mapFilter, filters, filterName, f, filterNames;
    buildingsId = Object.keys($rootScope.mapFilter);
    for (i = 0; i < buildingsId.length; i += 1) {
      bId = buildingsId[i];
      mapFilter = $rootScope.mapFilter[bId];
      if (mapFilter !== undefined) {
        bId = mapFilter.buildingId;
        filters = mapFilter.mergedFiltersForBuildings[bId];
        filterNames = mapFilter.bfilters[bId].belongsToItems;
        for (filterName in filters) {
          if (filters.hasOwnProperty(filterName)) {
            f = filters[filterName];
            (filterMethod(filterName, f, filterNames, bId, element));
          }
        }
        chartsData[bId][geoP.filtersNames[0].name](element);
      }
    }
  }

  geoP.app.directive('setupChart', function() {
    return {
      scope: true,
      replace: true,
      link: function($scope, element) {
        setupChartsLoadMethods($scope, element[0]);
      }
    };
  });

  geoP.app.controller('ChartController', function($scope, $rootScope) {
    $rootScope.currentCharts = currentCharts;
    $scope.filterNames = geoP.filtersNames;
    $scope.chartPaneClick = function(filter, bId) {
      var e, c;
      e = document.getElementById('chart_div_' + bId);
      chartsData[bId][filter.name](e);
      c = currentCharts[bId];
      c.chart.draw(c.a, c.options);
    };
  });
}(GeoP));
