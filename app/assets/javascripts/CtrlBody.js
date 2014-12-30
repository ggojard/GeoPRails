/*global GeoP:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BodyCtrl', function($scope, $http, $rootScope) {
    /*jslint unparam:true*/
    $rootScope.$on('SetBodyColor', function(e, building) {
      var color = building.color;
      if ($scope.bgColor === undefined) {
        $scope.bgColor = {};
      }
      if (color !== '' && color !== null) {
        $scope.bgColor[building.id] = color;
      }
    });
  });

}(GeoP));
