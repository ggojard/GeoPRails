(function(geoP) {


  function registerFilterCtrl($scope, $rootScope, filterName) {
    $scope.f[filterName] = {};
    $scope.f[filterName].checkAll = false;
    $scope.f[filterName]['filterStateChange'] = function(filter, e) {
      $rootScope.$emit(filterName + '_filters.StateChange', filter);
    };

    $scope.f[filterName].CheckAll = function() {
      // unCheckAllFilters($rootScope);

      for (var key in $scope.f[filterName].filters) {
        if ($scope.f[filterName].filters.hasOwnProperty(key)) {
          var filter = $scope.f[filterName].filters[key];
          filter.state = $scope.f[filterName].checkAll;
          $rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    }
    $rootScope.$on(filterName + '_filters.Update', function(e, filters) {
      $scope.f[filterName].filters = filters;
    });
  }

  geoP.app.controller('FiltersCtrl', function($scope, $rootScope) {
    $scope.f = {};
    $scope.filterNames = GeoP.filtersNames;
    for (var i = 0; i < $scope.filterNames.length; i++) {
      var filter = $scope.filterNames[i];
      registerFilterCtrl($scope, $rootScope, filter.name);
    }

    $scope.filterPaneClick = function(filter){
      $rootScope.$emit(filter.name + '_filters.Selected', filter);
    }
  });


}(GeoP))