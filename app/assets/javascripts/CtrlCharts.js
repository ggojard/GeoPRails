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

    filterMethod = function(fName, filter, filterNames) {
      $scope.chart = null;
      $rootScope.$on(fName + '_filters.Selected', function() {
        chartsData[fName]();
      });

      chartsData[fName] = function() {
        var data, itemId, item, a, options, chart, itemName;
        data = [
          // 'Nombre de pièces', 'Nombre de personnes',
          [fName, 'Surface (m²)', {
            role: 'style'
          }]
        ];
        for (itemId in filter) {
          if (filter.hasOwnProperty(itemId)) {
            item = filter[itemId];
            itemName = filterNames[fName][itemId];
            // item.count, item.nbPeople,
            data.push([itemName.name, item.areaSum, itemName.color]);
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
      var filters, filterName, f, filterNames;
      if ($rootScope.mapFilter !== undefined) {
        filters = $rootScope.mapFilter.mergedFiltersForBuildings[$scope.currentBuildingId];
        filterNames = $rootScope.mapFilter.bfilters[$scope.currentBuildingId].belongsToItems;
        for (filterName in filters) {
          if (filters.hasOwnProperty(filterName)) {
            f = filters[filterName];
            (filterMethod(filterName, f, filterNames));
          }
        }
        chartsData[geoP.filtersNames[0].name]();
      }
    });
  });
}(GeoP));

// /*global GeoP:true, google:true*/
// (function(geoP) {
//   'use strict';

//   google.load('visualization', '1.0', {
//     packages: ['corechart']
//   });

//   geoP.app.controller('ChartsCtrl', function($scope, $http, $rootScope) {
//     /*jslint unparam: true*/

//     // google.setOnLoadCallback(drawChart);
//     var chartsData = {},
//       filterMethod;

//     // filterFloorMethod = function(fName, filter, filterNames, values) {
//     //   var filterItem, itemId, item;
//     //   console.log('fmethod', filter, fName, filterNames);

//     //   // debugger;


//     //   // chartsData[fName] = function() {
//     //   for (itemId in filter) {
//     //     if (filter.hasOwnProperty(itemId)) {
//     //       filterItem = filterNames[fName][itemId];

//     //       item = filter[itemId];
//     //       // item.count, item.nbPeople,
//     //       // console.log(filterItem.name, item.areaSum, filterItem.color);
//     //       values.push([filterItem.name, item.areaSum, filterItem.color]);
//     //     }
//     //   }
//     //   // };
//     // };



//     filterMethod = function(fName, filters, filterNames) {
//       var data, a, options, chart, names = [],
//         // values = [],
//         floorId, floorFilters, itemId, item, fitlerByFloor = {},
//         valuesByItemAndFloor = {},
//         i, floors, fId;


//       $rootScope.$on(fName + '_filters.Selected', function() {
//         chartsData[fName]();
//       });


//       names = ['Surface (m²)'];



//       console.log(filterNames);


//       floors = Object.keys($rootScope.mapFilter.bfilters[$scope.currentBuildingId]);


//       for (floorId in filters) {
//         if (filters.hasOwnProperty(floorId) && floorId !== 'belongsToItems') {
//           floorFilters = filters[floorId];
//           names.push('Floor ' + floorId);



//           // for (fName in floorFilters) {
//           // if (floorFilters.hasOwnProperty(fName)) {

//           for (itemId in floorFilters[fName]) {
//             if (floorFilters[fName].hasOwnProperty(itemId)) {
//               item = floorFilters[fName][itemId];
//               // itemName = filterNames[fName][itemId];

//               if (fitlerByFloor === undefined) {
//                 fitlerByFloor = {};
//               }

//               if (fitlerByFloor[itemId] === undefined) {
//                 fitlerByFloor[itemId] = {};
//               }
//               fitlerByFloor[itemId][floorId] = item.areaSum;



//               for (i = 0; i < floors.length; i += 1) {
//                 fId = floors[i];
//                 if (fId !== 'belongsToItems') {
//                   if (fitlerByFloor[itemId][fId] === undefined) {
//                     fitlerByFloor[itemId][fId] = 0;
//                   }
//                 }
//               }

//               // values.push([itemName.name, item.areaSum, itemName.color]);
//             }
//           }

//           // console.log('OK', floors);

//           // itemId = filterNames[fName][itemId];

//           // item = filter[itemId];
//           // item.count, item.nbPeople,
//           // console.log(filterItem.name, item.areaSum, filterItem.color);
//           // values.push([filterItem.name, item.areaSum, filterItem.color]);
//           // }
//           // }



//           // console.log(f);
//         }
//       }
//       // console.log('chartFilter', filter, floorId);



//       valuesByItemAndFloor = {};
//       Object.keys(fitlerByFloor).forEach(function(itemId) {
//         var floorValueByFloor = fitlerByFloor[itemId];
//         if (valuesByItemAndFloor[itemId] === undefined) {
//           valuesByItemAndFloor[itemId] = [filterNames[fName][itemId].name];
//         }
//         Object.keys(floorValueByFloor).forEach(function(floorId) {
//           var floorValue = floorValueByFloor[floorId];
//           valuesByItemAndFloor[itemId].push(floorValue);
//         });
//         valuesByItemAndFloor[itemId].push('');


//       });

//       // for (floorId in filters) {
//       //   if (filters.hasOwnProperty(floorId) && floorId !== 'belongsToItems') {


//       //   }
//       // }

//       // debugger;

//       names.push({
//         role: 'annotation'
//       });

//       data = [
//         names
//       ];



//       Object.keys(valuesByItemAndFloor).forEach(function(itemId) {
//         data.push(valuesByItemAndFloor[itemId]);
//       });

//       // console.log('DATA', valuesByItemAndFloor, values);


//       // Object.keys(fitlerByFloor[fName])

//       $scope.chart = null;

//       // for (fName in filter) {
//       //   if (filter.hasOwnProperty(fName)) {

//       //     filterFloorMethod(fName, filter[fName], filterNames, values);
//       //   }
//       // }

//       console.log('data', fName, data);

//       chartsData[fName] = function() {

//         // if (data.values.length > 1) {
//         a = google.visualization.arrayToDataTable(data);
//         options = {};
//         // options.bar = {
//         //   groupWidth: '75%'
//         // };
//         options.colors = ['red', 'green'];

//         // options.is3D = true;
//         options.isStacked = true;
//         chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
//         chart.draw(a, options);
//         $scope.chart = chart;
//         // }
//       };

//     };
//     $rootScope.$on('MapFilter.Ready', function(mapFilter) {
//       var filters, filterNames, currentBuildingId, fName;

//       currentBuildingId = $rootScope.currentBuildingId;

//       console.log('currentBuildingId', currentBuildingId);

//       if ($rootScope.mapFilter !== undefined) {
//         filters = $rootScope.mapFilter.bfilters[currentBuildingId];
//         filterNames = $rootScope.mapFilter.bfilters[currentBuildingId].belongsToItems;

//         for (fName in filterNames) {
//           if (filterNames.hasOwnProperty(fName)) {

//             (filterMethod(fName, filters, filterNames));
//           }
//         }


//         chartsData[geoP.filtersNames[0].name]();
//       }
//     });
//   });
// }(GeoP));
