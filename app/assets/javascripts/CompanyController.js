/*global gon, GeoP*/
(function(geoP) {
  'use strict';
  var templates = {
    organizations: '/templates/organizations/organization.ng.html',
    organization_hierarchy: '/templates/organizations/organization_hierarchy.ng.html',
    import: '/templates/companies/import.ng.html'
  };

  function setUploader($scope, FileUploader) {
    var csrf_token, uploader;
    csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    uploader = new FileUploader({
      url: '/companies/import',
      headers: {
        'X-CSRF-TOKEN': csrf_token // X-CSRF-TOKEN is used for Ruby on Rails Tokens
      }
    });

    uploader.onSuccessItem = function(response, status) {
      /*jslint unparam:true*/
      if (status.error) {
        response.file.error = status.error;
        return geoP.notifications.error(status.error);
      }
      response.file.ok = 'ok';
      geoP.notifications.done(status.status);
    };
    $scope.uploader = uploader;
    $scope.token = csrf_token;
  }

  geoP.app.controller('CompanyController', function($scope, $rootScope, $http, FileUploader) {
    $rootScope.$emit('start-loading');
    setUploader($scope, FileUploader);
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

  geoP.app.controller('CompanyOrganizationsController', function($scope, $rootScope, $routeParams, $http) {
    $rootScope.$emit('start-loading');
    $http.get('/companies/' + $routeParams.companyId + '/organizations.json').success(function(company) {
      $scope.company = company;
      $scope.organizations = $scope.company.organizations;
      $scope.templates = templates;
      $rootScope.$emit('stop-loading');
    });
  });

}(GeoP));
