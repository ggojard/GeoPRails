/*global GeoP*/

(function(geoP) {
  'use strict';

  geoP.app.config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: '/templates/home.ng.html',
        controller: 'HomeController'
      }).
      when('/companies/:companyId', {
        templateUrl: '/templates/companies/company.ng.html',
        controller: 'CompanyController'
      }).
      when('/organizations/:organizationId', {
        reloadOnSearch: false,
        templateUrl: '/templates/organizations/show.ng.html'
      }).
      when('/companies/:companyId/organizations', {
        templateUrl: '/templates/companies/organizations_hierarchy.ng.html'
      }).
      when('/buildings/:buildingId', {
        reloadOnSearch: false,
        templateUrl: '/templates/buildings/building.ng.html',
        controller: 'BuildingController'
      }).
      when('/floors/:floorId', {
        reloadOnSearch: false,
        templateUrl: '/templates/floors/show.ng.html'
      }).
      when('/people', {
        templateUrl: '/templates/people/index.ng.html',
        controller: 'PeopleController'
      }).
      when('/people/:peopleId', {
        templateUrl: '/templates/people/show.ng.html'
      }).
      when('/item_types', {
        templateUrl: '/templates/item_types/index.ng.html',
        controller: 'ItemTypeController'
      }).
      when('/item_types/:itemTypeId', {
        templateUrl: '/templates/item_types/show.ng.html',
        controller: 'ItemTypeSingleController'
      }).
      otherwise({
        redirectTo: '/'
      });
    }
  ]);

}(GeoP));
