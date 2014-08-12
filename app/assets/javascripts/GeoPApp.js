(function() {

  $(function() {
    // rescroll if loaded scroll !== of current scroll (because of browser jump ?)
    var $w = $(window);
    $w.on('scroll', function(e) {
      try {
        var scrollLoaded = loadScroll(G_FloorJson.id);
        var scrollTop = $(window).scrollTop();
        if (scrollTop !== scrollLoaded) {
          $w.scrollTop(scrollLoaded);
        }
      } catch (e) {}
    });

  });

  var app = angular.module('GeoP', []).run(function($rootScope) { // instance-injector
    $rootScope.filters = [];

    try {
      var scrollTop = loadScroll(G_FloorJson.id);
      $(window).scrollTop(scrollTop);
    } catch (e) {}

  });

  GeoP.app = app;



  function registerScroll(floorId, scrollTop) {
    if (localStorage) {
      localStorage['floor-' + floorId + '-scroll-top'] = scrollTop;
    }
  }

  function loadScroll(floorId) {
    if (localStorage) {
      var c = localStorage['floor-' + floorId + '-scroll-top'];
      if (c !== void 0) {
        return parseInt(c, 10);
      }
    }
    return 0;
  }

  app.directive("keepscrolltop", function($window) {
    var count = 0;
    return function(scope, element, attrs) {
      angular.element($window).bind("scroll", function() {
        if (count > 0) {
          registerScroll(G_FloorJson.id, this.pageYOffset);
        }
        count += 1;
      });
    };
  });

  app.config(["$httpProvider",
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  // function unCheckAllFilters($rootScope) {
  // for (var i = 0; i < $rootScope.filters.length; i++) {
  //   var $scope = $rootScope.filters[i];
  //   $scope.checkAll = false;
  // for (var j = 0; j < $scope.filters.length; j++) {
  //   var filters = $scope.filters[j];
  //   for (var key in filters) {
  //     if (filters.hasOwnProperty(key)) {
  //       filters[key].state = false;
  //     }
  //   }
  // }
  // }
  // }


  app.controller('CompanyCtrl', function($scope, $http) {
    $scope.company = gon.company;
    // $scope.organizations = G_Organizations;
  });

  app.controller('FloorHeaderCtrl', function($scope, $http, $rootScope) {
    $scope.floorJson = G_FloorJson;
    $scope.roomJson = G_Room;
  });

  GeoP.setFloorMaps = function(floors, $scope, $http, $rootScope, callback) {
    $scope.svgEditors = {};
    var mapFilter = new GeoP.MapFilter($rootScope);
    setTimeout(function() {
      for (var i = 0; i < floors.length; i++) {
        var floor = floors[i];
        var editor = new GeoP.SvgEditor(floor, $scope, $http, $rootScope, mapFilter);
        $scope.svgEditors[floor.id] = editor;
        editor.loadRooms();
        editor.setOptions();
        mapFilter.addEditor(editor);
      }
      mapFilter.registerFiltersStateChange();
      $rootScope.mapFilter = mapFilter;
      mapFilter.ready();
      $scope.$apply();
      return callback && callback(mapFilter);
    }, 0);
  };

  GeoP.handleKeyEventsForScope = function($scope) {
    $scope.isShift = false;
    $scope.isCtrlKeyDown = false;
    $scope.isZKeyDown = false;

    function handleCtrlAndShif(ev) {
      var key, isShift, isCtrlKeyDown;
      if (window.event) {
        isShift = window.event.shiftKey ? true : false;
        isCtrlKeyDown = window.event.ctrlKey ? true : false;
      } else {
        isShift = ev.shiftKey ? true : false;
        isCtrlKeyDown = ev.ctrlKey ? true : false;
      }
      $scope.isShift = isShift;
      $scope.isCtrlKeyDown = isCtrlKeyDown;
    }

    function getKey(ev) {
      var key;
      if (window.event) {
        key = window.event.keyCode;
      } else {
        key = ev.which;
      }
      return key;
    }

    function keyDown(ev) {
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key === 90) {
        $scope.isZKeyDown = true;
      }
      $scope.$apply();
    }

    function keyUp(ev) {
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key === 90) {
        $scope.isZKeyDown = false;
      }
      $scope.$apply();
    }


    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
  };

  app.controller('FloorMapCtrl', function($scope, $http, $rootScope) {
    $scope.G_Mode = G_Mode;

    $scope.room = null;
    $scope.roomJson = G_Room;

    $scope.floors = [G_FloorJson];

    GeoP.handleKeyEventsForScope($scope);

    $scope.floorJson = G_FloorJson;

    $scope.mode = 'normal';

    GeoP.setFloorMaps($scope.floors, $scope, $http, $rootScope);

  });
}());