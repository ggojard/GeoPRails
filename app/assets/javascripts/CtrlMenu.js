(function(geoP) {
  geoP.app.controller('MenuCtrl', function($scope, $http) {
    $scope.search = function() {
      console.log($scope.globalSearch);
      if ($scope.globalSearch.length > 0) {
        $http.get('/search/' + $scope.globalSearch + '?' + Math.random()).success(function(res) {
          console.log(res);
          $scope.results = res;
        });
      } else {
        $scope.results = {};
      }
    }
    $scope.company = G_Company;
  });
}(GeoP))