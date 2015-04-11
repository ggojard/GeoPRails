/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('PersonCtrl', function($scope) {
    var p = gon.person;
    $scope.a = {
      person: p
    };
  });

  geoP.app.controller('PeopleCtrl', function($scope) {

    $scope.personFilter = function(a) {
      // return true;
      return a.person.fullname.search(new RegExp($scope.query, "i")) !== -1;
    };

    $scope.people = gon.people.map(function(p) {
      return {
        person: p
      };
    });
  });
}(GeoP));
