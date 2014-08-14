(function(){
  GeoP.app.controller('PersonCtrl', function($scope) {
    $scope.a = {
      person : gon.person
    };
    $scope.p = gon.person;
  });
}());