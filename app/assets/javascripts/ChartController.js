/*global GeoP, google, $*/
(function(geoP) {
  'use strict';
  google.load('visualization', '1.0', {
    packages: ['corechart']
  });

  var chartsData = {},
    currentCharts = {},
    filterMethod;

  geoP.chartsData = chartsData;


  geoP.createColumnChart = function(bId, element, data) {
    var a, options, chart;
    a = google.visualization.arrayToDataTable(data);
    options = {};
    // e = document.getElementById('chart_div_' + bId);
    // console.log(element);
    if (element === null) {
      return;
    }
    chart = new google.visualization.ColumnChart(element);
    chart.draw(a, options);

    console.log('e', $(element).width(), bId);


    (function(a, options, chart) {
      currentCharts[bId] = {
        a: a,
        options: options,
        chart: chart,
        data: data
          // $element: element,
          // bId: bId
      };
    }(a, options, chart));


  };

  filterMethod = function($scope, fName, filter, filterNames, bId) {
    // $scope.chart = null;

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
      // console.log('MapFilter.Ready', mapFilter);
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
        chartsData[bId][geoP.filtersNames[0].name](element);
      }
    }
  }


  geoP.app.directive('setupChart', function() {
    return {
      scope: true,
      replace: true,
      link: function($scope, element) {
        console.log(element);
        setupChartsLoadMethods($scope, element[0]);
        // debugger;
      }
    };
  });


  geoP.app.controller('ChartController', function($scope, $rootScope) {

    $rootScope.currentCharts = currentCharts;
    $scope.filterNames = geoP.filtersNames;

    $scope.chartPaneClick = function(filter, bId) {
      var e, c;
      console.log('chartPaneClick', filter, bId);
      e = document.getElementById('chart_div_' + bId);
      chartsData[bId][filter.name](e);
      // $rootScope.mapFilter[bId].updateEditorsRoomPositions();
      c = currentCharts[bId];
      // console.log('on refresh chart', c);
      // c.$element.show();
      c.chart.draw(c.a, c.options);

      // $rootScope.$emit(filter.name + '_' + bId + '_charts.Selected', filter);
    };

    // function registerFilterForChart(filterName, buildingId) {
    //   $rootScope.$on(filterName + '_' + buildingId + '_charts.Selected', function() {
    //     chartsData[buildingId][filterName]();
    //     $rootScope.mapFilter[buildingId].updateEditorsRoomPositions();
    //   });
    // }

    // function registerFiltersForChart() {
    //   var buildingsId, i, j, bId, filter;
    //   buildingsId = Object.keys($rootScope.mapFilter);
    //   for (i = 0; i < geoP.filtersNames.length; i += 1) {
    //     filter = geoP.filtersNames[i];
    //     for (j = 0; j < buildingsId.length; j += 1) {
    //       bId = buildingsId[j];
    //       // registerFilterForChart(filter.name, bId);
    //     }
    //   }
    // }

    // $rootScope.$on('Refresh.CurrentChart', function(e, buildingId) {
    //   /*jslint unparam:true*/
    //   var c = currentCharts[buildingId];
    //   console.log('on refresh chart', c);
    //   // c.$element.show();
    //   c.chart.draw(c.a, c.options);
    // });


    // registerFiltersForChart();

  });
}(GeoP));
