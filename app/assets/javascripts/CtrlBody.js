/*global GeoP, gon, Spinner*/
(function(geoP) {
  'use strict';


  var opts = {
    lines: 15, // The number of lines to draw
    length: 0, // The length of each line
    width: 5, // The line thickness
    radius: 20, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#5CC2B8', // #rgb or #rrggbb or array of colors
    speed: 2.3, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };


  geoP.app.controller('BodyCtrl', function($scope, $http, $rootScope) {
    /*jslint unparam:true*/
    var spinner, spinnerContainer;
    spinnerContainer = document.getElementById('spinner-zone');
     spinner = new Spinner(opts).spin(spinnerContainer);
    spinnerContainer.className = '';
    $rootScope.$on('stop-loading', function() {
      if (spinner !== undefined) {
        spinner.stop();
        $rootScope.loading = false;
        spinnerContainer.className = 'hidden';
      }
    });

    $rootScope.userType = gon.userType;

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
