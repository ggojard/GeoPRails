/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('PersonCtrl', function($scope, $rootScope) {
    $scope.i18n = gon.i18n;
    var p = gon.person;
    $scope.a = {
      person: p
    };
    $rootScope.$emit('stop-loading');
  });

  geoP.app.controller('PeopleController', function($scope, $rootScope, $http) {
    $scope.i18n = gon.i18n;
    $scope.personFilter = function(a) {
      return a.person.fullname.search(new RegExp($scope.query, 'i')) !== -1;
    };

    $http.get('/people.json').success(function(people) {
      console.log(people);
      $scope.people = people.map(function(p) {
        return {
          person: p
        };
      });
      $rootScope.$emit('stop-loading');
    });



  });
}(GeoP));
