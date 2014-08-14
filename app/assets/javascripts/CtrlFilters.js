(function(geoP) {


  function registerFilterCtrl($scope, $rootScope, filterName) {
    $scope.f[filterName] = {};
    $scope.f[filterName].checkAll = false;
    $scope.f[filterName].filterStateChange = function(filter, e) {
      $rootScope.$emit(filterName + '_filters.StateChange', filter);
    };
    $scope.f[filterName].CheckAll = function() {
      for (var key in $scope.f[filterName].filters) {
        if ($scope.f[filterName].filters.hasOwnProperty(key)) {
          var filter = $scope.f[filterName].filters[key];
          filter.state = $scope.f[filterName].checkAll;
          $rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    };
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

    $scope.filterPaneClick = function(filter) {
      $rootScope.$emit(filter.name + '_filters.Selected', filter);
    };

    console.log($('#filter-chart').length);
    var c = function() {
      // do something…
      console.log('hide');
    };
    $('#filter-chart').on('hidden.bs.collapse', c);
    $('#filter-chart').on('show.bs.collapse', c);

    // $('#filter-chart h3').on('click', function() {
    //   console.log('click');

    //   $rootScope.$emit('MapFilter.Ready', $rootScope.mapFilter);
    // })

  });


}(GeoP));