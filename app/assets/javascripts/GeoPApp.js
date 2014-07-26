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


  function registerFilterCtrl($scope, $rootScope, filterName) {
    $scope.f[filterName] = {};
    $scope.f[filterName].checkAll = false;
    $scope.f[filterName]['filterStateChange'] = function(filter, e) {
      $rootScope.$emit(filterName + '_filters.StateChange', filter);
    };

    $scope.f[filterName].CheckAll = function() {
      // unCheckAllFilters($rootScope);

      for (var key in $scope.f[filterName].filters) {
        if ($scope.f[filterName].filters.hasOwnProperty(key)) {
          var filter = $scope.f[filterName].filters[key];
          filter.state = $scope.f[filterName].checkAll;
          $rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    }
    $rootScope.$on(filterName + '_filters.Update', function(e, filters) {
      $scope.f[filterName].filters = filters;
    });
  }

  app.controller('FiltersCtrl', function($scope, $rootScope) {
    $scope.f = {};
    $scope.filterNames = GeoP.filtersNames;
    for (var i = 0; i < $scope.filterNames.length; i++) {
      var filter = $scope.filterNames[i];
      registerFilterCtrl($scope, $rootScope, filter.name);
    }
  });

  app.controller('RootCtrl', function($scope) {
    $scope.root = G_RootJson;
  });


  app.controller('CompanyCtrl', function($scope, $http) {
    $scope.company = G_Company;
  });

  app.controller('FloorHeaderCtrl', function($scope, $http, $rootScope) {
    $scope.floorJson = G_FloorJson;
    $scope.roomJson = G_Room;
  });

  GeoP.setFloorMaps = function(floors, $scope, $http, $rootScope) {
    $scope.svgEditors = {};
    setTimeout(function() {
      for (var i = 0; i < floors.length; i++) {
        var floor = floors[i];
        var editor = new GeoP.SvgEditor(floor, $scope, $http, $rootScope);
        $scope.svgEditors[floor.id] = editor;
        editor.loadRooms();
        editor.setOptions();
      }
      $scope.$apply();
    }, 0);
  };

  GeoP.handleKeyEventsForScope = function($scope) {
    $scope.isShift = false;
    $scope.isCtrlKeyDown = false;
    function handleKey(ev) {
      var key, isShift, isCtrlKeyDown;
      if (window.event) {
        key = window.event.keyCode;
        isShift = window.event.shiftKey ? true : false;
        isCtrlKeyDown = window.event.ctrlKey ? true : false;
      } else {
        key = ev.which;
        isShift = ev.shiftKey ? true : false;
        isCtrlKeyDown = ev.ctrlKey ? true : false;
      }
      $scope.isShift = isShift;
      $scope.isCtrlKeyDown = isCtrlKeyDown;
      $scope.$apply();
    }

    document.onkeydown = handleKey;
    document.onkeyup = handleKey;
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