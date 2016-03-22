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
      when('/buildings/:buildingId', {
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
      when('/items/', {
        templateUrl: '/templates/items/index.ng.html',
        controller: 'ItemController'
      }).
      when('/items/:itemId', {
        templateUrl: '/templates/items/show.ng.html',
        controller: 'ItemSingleController'
      }).
      otherwise({
        redirectTo: '/'
      });
    }
  ]);

}(GeoP));
