/*global gon, GeoP*/
(function(geoP) {
  'use strict';
  var templates = {
    organizations: '/templates/organization.ng.html',
    organization_hierarchy: '/templates/organization_hierarchy.ng.html'
  };
  geoP.app.controller('CompanyController', function($scope, $rootScope, $http) {
    $scope.company = gon.company;
    $scope.templates = templates;
    if ($scope.company === null) {
      $rootScope.$emit('stop-loading');
    } else {
      $http.get('/companies/' + gon.company.id + '/organizations.json').success(function(company) {
        $scope.organizations = company.organizations;
        $rootScope.$emit('stop-loading');
      });
    }
  });

  geoP.app.controller('CompanyOrganizationsController', function($scope, $rootScope, $http) {
    $scope.company = gon.company_organizations;
    $scope.organizations = $scope.company.organizations;
    $scope.templates = templates;
    $rootScope.$emit('stop-loading');
  });

}(GeoP));
