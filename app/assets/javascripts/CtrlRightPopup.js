(function(geoP) {
  "use strict";


  geoP.app.controller('CtrlRightPopup', function($scope, $rootScope) {

    $scope.state = 'hidden';
    $scope.saveScrollTop = $('body').scrollTop();

    function scrollBackToInitialScroll(){
      $('body').scrollTop($scope.saveScrollTop);
    }

    $scope.hide = function() {
      $scope.state = 'hidden';
    }
    $scope.show = function() {
      $scope.state = 'visible';
      $scope.saveScrollTop = $('body').scrollTop();
      $('body').scrollTop(0);
    }

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
    }

    $scope.cancel = function(){
      scrollBackToInitialScroll();
      $scope.hide();
    }

    $rootScope.$on('RightPopupShow', function(e, title, content, actions) {
      $scope.title = title;
      $scope.content = content;
      $scope.actions = actions;
      $scope.show();
    });

    $rootScope.$on('RightPopupHide', function(e) {
      $scope.hide();
    });

  });


}(GeoP));