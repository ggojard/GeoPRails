(function(geoP) {
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
    $scope.company = gon.company;
  });
}(GeoP));