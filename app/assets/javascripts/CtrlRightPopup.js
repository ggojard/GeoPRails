/*global GeoP:true, jQuery:true*/
(function(geoP, $) {
  'use strict';

  geoP.app.controller('CtrlRightPopup', function($scope, $rootScope) {
    $scope.state = 'hidden';
    $scope.saveScrollTop = $('body').scrollTop();

    function scrollBackToInitialScroll() {
      $('body, html').scrollTop($scope.saveScrollTop);
    }

    $scope.hide = function() {
      $scope.state = 'hidden';
    };
    $scope.show = function() {
      $scope.state = 'visible';
      $scope.saveScrollTop = $('body').scrollTop();
      $('body, html').scrollTop(0);
    };

    $scope.doAction = function(callback) {
      if (typeof callback === 'function') {
        callback(function(res) {
          if (res.status === 'OK') {
            scrollBackToInitialScroll();
            $scope.hide();
          } else {
            $scope.error = res.error;
          }
        });
      }
    };

    $scope.cancel = function() {
      scrollBackToInitialScroll();
      $scope.hide();
    };

    $rootScope.$on('RightPopupShow', function(e, title, content, actions) {
      /*jslint unparam:true*/
      $scope.title = title;
      $scope.content = content;
      $scope.actions = actions;
      $scope.show();
    });

    $rootScope.$on('RightPopupHide', function() {
      $scope.hide();
    });
  });
}(GeoP,jQuery));
