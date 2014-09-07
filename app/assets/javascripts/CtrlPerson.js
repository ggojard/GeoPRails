/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('PersonCtrl', function($scope) {
    var p = gon.person;
    $scope.a = {
      person: p
    };
  });
}(GeoP));
