/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('PersonCtrl', function($scope) {
    $scope.a = {
      person: gon.person
    };
    $scope.p = gon.person;
  });
}(GeoP));
