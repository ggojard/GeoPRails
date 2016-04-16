/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('PersonController', function($scope, $rootScope, $http, $routeParams) {
    $rootScope.$emit('start-loading');
    $scope.i18n = gon.i18n;
    $http.get('/people/' + $routeParams.peopleId + '.json').success(function(p) {
      $scope.a = {
        person: p
      };
      $rootScope.$emit('stop-loading');
    });
  });


  geoP.app.directive('singlePerson', function() {
    return {
      templateUrl: '/templates/floors/person.ng.html'
    };
  });

  geoP.app.controller('PeopleController', function($scope, $rootScope, $http) {
    $rootScope.$emit('start-loading');
    $scope.i18n = gon.i18n;
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;

    $scope.personFilter = function(a) {
      return a.person.fullname.search(new RegExp($scope.query, 'i')) !== -1;
    };
    $http.get('/people.json').success(function(people) {
      $scope.people = people.map(function(p) {
        return {
          person: p
        };
      });
      $rootScope.$emit('stop-loading');
    });

  });
}(GeoP));
