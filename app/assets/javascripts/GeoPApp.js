/*global gon:true, jQuery:true, GeoP:true, angular:true*/

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

  var app = angular.module('GeoP', ['ui.sortable']).run(function() { // instance-injector
    try {
      var scrollTop = loadScroll(gon.floor.id);
      $(window).scrollTop(scrollTop);
    } catch (e) {
      return e;
    }
  });


  app.directive('setupEditor', function() {
    return {
      transclude: true,
      scope: true,
      link: function($scope, element, attrs) {
        var editor, floor, floorId, mapFilter, buildingId;
        floorId = attrs.floorId;
        buildingId = attrs.buildingId;
        mapFilter = $scope.mapFilter[buildingId];
        floor = mapFilter.floorJsonById[floorId];
        editor = new geoP.SvgEditor(floor, mapFilter, $scope, element[0]);
        editor.loadRooms();
        editor.setOptions();
        mapFilter.addEditor(editor);
        $scope.$emit('editor-loaded', editor);
        setTimeout(function() {
          geoP.selectPolylineIfIsInHash($scope, buildingId);
        }, 1000);
      }
    };
  });

  geoP.app = app;

  app.directive('tabHeader', function() {
    return {
      scope: true,
      replace: true,
      link: function($scope, element, attr) {
        $(element).on('shown.bs.tab', function() {
          if (attr.type === 'charts') {
            geoP.refreshCurrentChart(attr.buildingId, $scope);
          }
          $scope.mapFilter[attr.buildingId].updateEditorsRoomPositions();
        });
      }
    };
  });

  app.directive('keepscrolltop', function($window) {
    var count = 0;
    return function() {
      angular.element($window).bind('scroll', function() {
        if (count > 0) {
          registerScroll(gon.floor.id, this.pageYOffset);
        }
        count += 1;
      });
    };
  });

  app.config(['$httpProvider',
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  app.controller('CompanyCtrl', function($scope, $rootScope) {
    $scope.company = gon.company;
    $scope.organizations = gon.organizations;
    $rootScope.$emit('stop-loading');
  });

  geoP.selectPolylineIfIsInHash = function($scope, buildingId) {
    var roomId, floorId, floorEditor;
    roomId = geoP.getRoomIdFromHash();

    for (floorId in $scope.mapFilter[buildingId].editorsByFloorId) {
      if ($scope.mapFilter[buildingId].editorsByFloorId.hasOwnProperty(floorId)) {
        floorEditor = $scope.mapFilter[buildingId].editorsByFloorId[floorId];
        if (floorEditor.itemsById[roomId]) {
          $scope.roomId = roomId;
          floorEditor.itemsById[$scope.roomId].selectPolyline();
          return floorEditor.itemsById[$scope.roomId];
        }
      }
    }
    return null;
  };

  geoP.setFloorsMaps = function(buildingId, floors, $rootScope, $http) {
    var i, floor, mapFilter;
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

  geoP.countPeopleFromRooms = function(rooms) {
    return rooms.reduce(function(a, b) {
      var res = a;
      if (b.free_desk_number !== null) {
        res += b.free_desk_number;
      }
      return res;
    }, 0);
  };

  app.controller('FloorMapCtrl', function($scope, $http, $rootScope) {
    $scope.floorsByBuildingId = {};
    $scope.mapMode = gon.mode;
    $scope.i18n = gon.i18n;
    geoP.registerEditorStopLoading($rootScope);

    $http.get('/floors/' + gon.floor.id + '.json').success(function(floor) {

      $rootScope.$emit('SetBodyColor', floor.building);
      $rootScope.room = null;
      $scope.roomId = geoP.getRoomIdFromHash();
      $scope.buildings = [floor.building_id];
      $rootScope.buildings = $scope.buildings;
      $scope.buildingId = floor.building_id;
      $scope.floorsByBuildingId[floor.building_id] = [floor];

      geoP.handleKeyEventsForScope($scope);

      $scope.floorJson = floor;
      geoP.setFloorsMaps(floor.building_id, $scope.floorsByBuildingId[floor.building_id], $rootScope, $http);
    });

    $scope.countPeopleFromRooms = function(rooms) {
      return rooms.reduce(function(a, b) {
        return a + b.affectations.length;
      }, 0);
    };

    $scope.countFreeSpacesFromRooms = function(rooms) {
      return geoP.countPeopleFromRooms(rooms);
    };


  });
}(GeoP, gon, jQuery, angular));
