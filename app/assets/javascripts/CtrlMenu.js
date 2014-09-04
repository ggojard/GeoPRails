/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('MenuCtrl', function($scope, $http) {
    $scope.search = function() {
      if ($scope.globalSearch.length > 0) {
        $http.get('/search/' + $scope.globalSearch + '?' + Math.random()).success(function(res) {
          $scope.results = res;
        });
      } else {
        $scope.results = {};
      }
    };
    $scope.company = JSON.parse(gon.company);
  });
}(GeoP));
