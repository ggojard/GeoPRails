/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('MenuCtrl', function($scope, $http) {
    $scope.search = function() {
      $scope.loading = true;
      if ($scope.globalSearch.length > 0) {
        $http.get('/search/' + $scope.globalSearch + '?' + Math.random()).success(function(res) {
          $scope.results = res;
          $scope.loading = false;
        });
      } else {
        $scope.results = {};
        $scope.loading = false;
      }
    };
    $scope.company = gon.company;
  });
}(GeoP));
