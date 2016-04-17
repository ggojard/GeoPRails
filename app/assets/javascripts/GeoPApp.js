/*global gon, jQuery, GeoP, angular*/

(function(geoP, gon, $, angular) {
  'use strict';

  function registerScroll(floorId, scrollTop) {
    if (localStorage) {
      localStorage['floor-' + floorId + '-scroll-top'] = scrollTop;
    }
  }

  function loadScroll(floorId) {
    if (localStorage) {
      var c = localStorage['floor-' + floorId + '-scroll-top'];
      if (c !== undefined) {
        return parseInt(c, 10);
      }
    }
    return 0;
  }

  $(function() {
    // rescroll if loaded scroll !== of current scroll (because of browser jump ?)
    var $w = $(window);
    $w.on('scroll', function() {
      var scrollLoaded, scrollTop;
      try {
        scrollLoaded = loadScroll(gon.floor.id);
        scrollTop = $(window).scrollTop();
        if (scrollTop !== scrollLoaded) {
          $w.scrollTop(scrollLoaded);
        }
      } catch (e) {
        return e;
      }
    });
  });

  var app = angular.module('GeoP', ['ngRoute', 'as.sortable', 'FBAngular', 'ui.bootstrap', 'angularFileUpload']);
  app.run(function() { // instance-injector
    try {
      var scrollTop = loadScroll(gon.floor.id);
      $(window).scrollTop(scrollTop);
    } catch (e) {
      return e;
    }
  });

  app.filter('offset', function() {
    return function(input, start) {
      if (input !== undefined) {
        start = parseInt(start, 10);
        return input.slice(start);
      }
    };
  });

  app.filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) {
        text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
      }
      return $sce.trustAsHtml(text);
    };
  });

  app.directive('setupEditor', function() {
    return {
      transclude: true,
      // scope: true,
      link: function($scope, element, attrs) {
        setTimeout(function() {
          var editor, floor, floorId, mapFilter, buildingId;
          floorId = attrs.floorId;
          buildingId = attrs.buildingId;
          mapFilter = $scope.mapFilter[buildingId];
          floor = mapFilter.floorJsonById[floorId];
          editor = new geoP.SvgEditor(floor, mapFilter, $scope, element[0]);
          editor.updateRoomsRatio();
          editor.createRoomsPolylines();
          editor.setOptions();
          mapFilter.addEditor(editor);
          geoP.$apply($scope);
          $scope.$emit('editor-loaded', editor);
          $scope.$emit('editor-loaded-' + buildingId, editor);
          setTimeout(function() {
            geoP.selectPolylineIfIsInRouteParams($scope, buildingId);
          }, 1000);
        }, 0);
      }
    };
  });

  geoP.app = app;

  // app.directive('keepscrolltop', function($window) {
  //   var count = 0;
  //   return function() {
  //     angular.element($window).bind('scroll', function() {
  //       if (count > 0) {
  //         registerScroll(gon.floor.id, this.pageYOffset);
  //       }
  //       count += 1;
  //     });
  //   };
  // });

  app.config(['$httpProvider',
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);


  geoP.selectPolylineIfIsInRouteParams = function($scope, buildingId) {
    var roomId, floorId, floorEditor, room;
    roomId = $scope.$routeParams.rId;

    // find current room in the available editors and stop browsing editors when found
    for (floorId in $scope.mapFilter[buildingId].editorsByFloorId) {
      if ($scope.mapFilter[buildingId].editorsByFloorId.hasOwnProperty(floorId)) {
        floorEditor = $scope.mapFilter[buildingId].editorsByFloorId[floorId];
        room = floorEditor.selectPolyline(roomId);
        if (room !== null) {
          return room;
        }
      }
    }
    return null;
  };

  geoP.setFloorsMaps = function(buildingId, floors, $rootScope, $http) {
    var i, floor, mapFilter;
    if (floors === undefined) {
      return false;
    }
    mapFilter = new geoP.MapFilter($rootScope, $http, buildingId);
    if ($rootScope.floorsToLoad === undefined) {
      $rootScope.floorsToLoad = 0;
    }
    $rootScope.floorsToLoad += floors.length;
    for (i = 0; i < floors.length; i += 1) {
      floor = floors[i];
      mapFilter.addFloorJson(floor);
    }
    mapFilter.setup();
  };

  geoP.handleKeyEventsForScope = function($scope) {
    $scope.isShift = false;
    $scope.isCtrlKeyDown = false;
    $scope.isZKeyDown = false;

    function handleCtrlAndShif(ev) {
      var isShift, isCtrlKeyDown;
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
      var key;
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key !== undefined) {
        if (key === 90) {
          $scope.isZKeyDown = true;
        }
        // $scope.$apply();
      }
    }

    function keyUp(ev) {
      var key;
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key !== undefined) {
        if (key === 90) {
          $scope.isZKeyDown = false;
        }
        // $scope.$apply();
      }
    }
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
  };

  geoP.countFreeDesksFromRooms = function(rooms) {
    return rooms && rooms.reduce(function(a, b) {
      var res = a;
      if (b.free_desk_number !== null) {
        res += b.free_desk_number;
      }
      return res;
    }, 0);
  };

  geoP.getTotalArea = function(rooms) {
    var res = rooms.reduce(function(a, b) {
      return a + b.area;
    }, 0);
    return res.toFixed(2);
  };


}(GeoP, gon, jQuery, angular));
