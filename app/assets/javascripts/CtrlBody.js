/*global GeoP:true*/
(function(geoP) {
  'use strict';

  geoP.app.controller('BodyCtrl', function($scope, $http, $rootScope) {
    /*jslint unparam:true*/
    $rootScope.$on('SetBodyColor', function(e, color) {
      if (color !== '' && color !== null) {
        $scope.bgColor = color;
      }
    });

  });


}(GeoP));
