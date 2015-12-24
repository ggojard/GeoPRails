/*global gon, GeoP*/
(function(geoP) {
  'use strict';
  geoP.app.controller('CompanyController', function($scope, $rootScope) {
    $scope.company = gon.company;
    $scope.organizations = gon.organizations;
    $rootScope.$emit('stop-loading');
  });
}(GeoP));
