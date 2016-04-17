/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('MenuController', function($scope, $http, $q, $rootScope) {
    $scope.searchRequests = [];

    function stopSearchRequests() {
      var i, canceller;
      for (i = 0; i < $scope.searchRequests.length; i += 1) {
        canceller = $scope.searchRequests[i];
        // canceller.stop();
        canceller.resolve('user cancelled');
      }
      $scope.searchQueries = [];
    }

    $scope.closeSearch = function() {
      $scope.results = {};
      $scope.globalSearch = '';
    };

    $scope.search = function() {
      var canceller;
      if ($scope.globalSearch.length > 0) {
        stopSearchRequests();
        canceller = $q.defer();
        $http.get('/search/' + $scope.globalSearch + '?' + Math.random(), {
          timeout: canceller.promise
        }).success(function(res) {
          $scope.results = res;
        });
        $scope.searchRequests.push(canceller);
      } else {
        $scope.results = {};
      }
    };
    $scope.company = gon.company;
  });

  geoP.app.directive('globalSearchReplace', function() {
    return {
      restrict: 'A',
      scope: true,
      replace: true,
      link: function(scope, element, attrs) {
        if (scope.globalSearch && scope.globalSearch.length > 0) {
          var text = attrs.value.replace(new RegExp('(' + scope.globalSearch + ')', 'gi'), '<span class="highlighted">$1</span>');
          element.html(text);
        }
      }
    };
  });



}(GeoP));
