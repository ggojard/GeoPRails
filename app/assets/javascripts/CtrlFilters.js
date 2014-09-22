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
      for (key in $scope.f[filterName].filters.names) {
        if ($scope.f[filterName].filters.names.hasOwnProperty(key)) {
          filter = $scope.f[filterName].filters.names[key];
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
    var i, filter;
    $scope.f = {};
    $scope.filterNames = GeoP.filtersNames;
    for (i = 0; i < $scope.filterNames.length; i += 1) {
      filter = $scope.filterNames[i];
      registerFilterCtrl($scope, $rootScope, filter.name);
    }

    $scope.filterPaneClick = function(filter, bId) {
      $rootScope.$emit(filter.name + '_' + bId + '_filters.Selected', filter);
    };

    $('#filter-chart-content').on('shown.bs.collapse', function() {
      $('#chart_div').show();
      $rootScope.$emit('MapFilter.Ready', $rootScope.mapFilter);
      $('#chart_div').addClass('animated fadeIn');
      $rootScope.mapFilter.updateEditorsRoomPositions();
    });
    $('#filter-chart-content').on('show.bs.collapse', function() {
      $('#chart_div').hide();
    });

    $('#filter-chart-content').on('hidden.bs.collapse', function() {
      $rootScope.mapFilter.updateEditorsRoomPositions();
    });


  });

}(GeoP, jQuery));
