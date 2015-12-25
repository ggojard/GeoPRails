/*global gon, GeoP*/
(function(geoP) {
  'use strict';
  geoP.app.controller('CompanyController', function($scope, $rootScope, $http) {
    $scope.company = gon.company;
    $scope.templates = {
      organizations: '/templates/organization.ng.html'
    };
    if (gon.company === null) {
      $rootScope.$emit('stop-loading');
    } else {
      $http.get('/companies/' + gon.company.id + '/organizations').success(function(company) {
        $scope.organizations = company.organizations;
        $rootScope.$emit('stop-loading');
      });
    }
  });
}(GeoP));
