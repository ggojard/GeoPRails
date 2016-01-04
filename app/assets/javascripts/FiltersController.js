/*global GeoP*/
(function(geoP) {
  'use strict';
  geoP.app.controller('FiltersController', function($scope, $rootScope) {
    $scope.f = $rootScope.f;
    $scope.filterNames = GeoP.filtersNames;
  });
}(GeoP));
