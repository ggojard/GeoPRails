/*global GeoP*/

(function(geoP) {
  'use strict';

  geoP.app.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: '/templates/home.ng.html'
      }).
      when('/companies/:companyId', {
        templateUrl: '/templates/companies/company.ng.html',
        controller: 'CompanyController'
      }).
      when('/buildings/:buildingId', {
        templateUrl: '/templates/buildings/building.ng.html',
        controller: 'BuildingController'
      }).
      when('/floors/:floorId', {
        templateUrl: '/templates/floors/show.ng.html',
        controller: 'FloorController'
      }).
      when('/people', {
        templateUrl: '/templates/people/index.ng.html',
        controller: 'PeopleController'
      }).

      otherwise({
        redirectTo: '/'
      });
    }
  ]);

}(GeoP));
