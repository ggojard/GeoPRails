/*global GeoP:true, jQuery:true*/
(function(geoP, $) {
  'use strict';


  function registerFilterCtrl($scope, $rootScope, filterName) {
    $scope.f[filterName] = {};
    $scope.f[filterName].checkAll = false;
    $scope.f[filterName].filterStateChange = function(filter) {
      $rootScope.$emit(filterName + '_filters.StateChange', filter);
    };
    $scope.f[filterName].CheckAll = function() {
      var key, filter;
      for (key in $scope.f[filterName].filters) {
        if ($scope.f[filterName].filters.hasOwnProperty(key)) {
          filter = $scope.f[filterName].filters[key];
          filter.state = $scope.f[filterName].checkAll;
          $rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    };
    $rootScope.$on(filterName + '_filters.Update', function(e, filters) {
      /*jslint unparam:true */
      $scope.f[filterName].filters = filters;
    });
  }

  geoP.app.controller('FiltersCtrl', function($scope, $rootScope) {
    var i, filter, c;
    $scope.f = {};
    $scope.filterNames = GeoP.filtersNames;
    for (i = 0; i < $scope.filterNames.length; i += 1) {
      filter = $scope.filterNames[i];
      registerFilterCtrl($scope, $rootScope, filter.name);
    }

    $scope.filterPaneClick = function(filter) {
      $rootScope.$emit(filter.name + '_filters.Selected', filter);
    };

    // console.log($('#filter-chart').length);
    
    // $('#filter-chart-content').on('hidden.bs.collapse', c);
    $('#filter-chart-content').on('shown.bs.collapse', function() {
      $('#chart_div').show();
      $rootScope.$emit('MapFilter.Ready', $rootScope.mapFilter);
      $('#chart_div').addClass('animated bounceIn');
    });
    $('#filter-chart-content').on('show.bs.collapse', function() {
      $('#chart_div').hide();
    });

    // $('#filter-chart h3').on('click', function() {
    //   console.log('click');
    //   
    // })
  });

}(GeoP, jQuery));
