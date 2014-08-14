(function(geoP) {

  google.load("visualization", "1.0", {
    packages: ["corechart"]
  });


  geoP.app.controller('ChartsCtrl', function($scope, $http, $rootScope) {

    // google.setOnLoadCallback(drawChart);
    var chartsData = {};


    var filterMethod = function(fName, filter) {


      $rootScope.$on(fName + '_filters.Selected', function() {
        chartsData[fName]();
      });

      chartsData[fName] = function() {
        var data = [
          // 'Nombre de pièces', 'Nombre de personnes',
          [fName, 'Surface (m²)', {
            role: 'style'
          }]
        ];
        for (var itemId in filter) {
          if (filter.hasOwnProperty(itemId)) {
            var item = filter[itemId];
            // item.count, item.nbPeople,
            data.push([item.name, item.areaSum, item.color]);
          }
        }
        var a = google.visualization.arrayToDataTable(data);
        var options = {};


        var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
        chart.draw(a, options);
      };
    };

    $rootScope.$on('MapFilter.Ready', function(mapFilter) {
      // console.log('reday', mapFilter);
      var filters = $rootScope.mapFilter.filters;
      for (var filterName in filters) {
        if (filters.hasOwnProperty(filterName)) {
          var f = filters[filterName];
          (filterMethod(filterName, f));
        }
      }

      chartsData[geoP.filtersNames[0].name]();

    });


  });


}(GeoP));