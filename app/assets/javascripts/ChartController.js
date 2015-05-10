/*global GeoP, google, $*/
(function(geoP) {
  'use strict';
  google.load('visualization', '1.0', {
    packages: ['corechart']
  });

  var chartsData = {},
    currentCharts = {},
    filterMethod;

  filterMethod = function($scope, fName, filter, filterNames, bId, element) {
    // $scope.chart = null;

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
        // e = document.getElementById('chart_div_' + bId);
        if (element === null) {
          return;
        }
        chart = new google.visualization.ColumnChart(element);
        chart.draw(a, options);

        currentCharts[bId] = {
          a: a,
          options: options,
          chart: chart,
          $element: $(element)
        };
      }
    };
  };

  function setupChartsLoadMethods($rootScope, element) {
    var buildingsId, i, bId, mapFilter, filters, filterName, f, filterNames;
    buildingsId = Object.keys($rootScope.mapFilter);
    for (i = 0; i < buildingsId.length; i += 1) {
      bId = buildingsId[i];
      mapFilter = $rootScope.mapFilter[bId];
      console.log('MapFilter.Ready', mapFilter);
      if (mapFilter !== undefined) {
        bId = mapFilter.buildingId;
        filters = mapFilter.mergedFiltersForBuildings[bId];
        filterNames = mapFilter.bfilters[bId].belongsToItems;
        for (filterName in filters) {
          if (filters.hasOwnProperty(filterName)) {
            f = filters[filterName];
            (filterMethod($rootScope, filterName, f, filterNames, bId, element));
          }
        }
        chartsData[bId][geoP.filtersNames[0].name]();
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
      console.log('chartPaneClick', filter, bId);
      $rootScope.$emit(filter.name + '_' + bId + '_charts.Selected', filter);
    };

    function registerFilterForChart(filterName, buildingId) {

      $rootScope.$on(filterName + '_' + buildingId + '_charts.Selected', function() {
        chartsData[buildingId][filterName]();
        $rootScope.mapFilter[buildingId].updateEditorsRoomPositions();
      });
    }

    function registerFiltersForChart() {
      var buildingsId, i, j, bId, filter;
      buildingsId = Object.keys($rootScope.mapFilter);
      for (i = 0; i < geoP.filtersNames.length; i += 1) {
        filter = geoP.filtersNames[i];
        for (j = 0; j < buildingsId.length; j += 1) {
          bId = buildingsId[j];
          registerFilterForChart(filter.name, bId);
        }
      }
    }
    $rootScope.$on('Refresh.CurrentChart', function(e, buildingId) {
      /*jslint unparam:true*/
      var c = currentCharts[buildingId];
      console.log('on refresh chart', c);
      c.$element.show();
      c.chart.draw(c.a, c.options);
    });


    registerFiltersForChart();

  });
}(GeoP));
