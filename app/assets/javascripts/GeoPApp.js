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

  app.controller('GlobalCtrl', function($scope) {
    $scope.company = G_Company;
  });

  app.controller('CompanyCtrl', function($scope, $http) {
    $scope.company = G_Company;
  });

  app.controller('FloorHeaderCtrl', function($scope, $http, $rootScope) {
    $scope.floorJson = G_FloorJson;
    $scope.roomJson = G_Room;
  });


  app.controller('GeoPCtrl', function($scope, $http, $rootScope) {
    $scope.G_Mode = G_Mode;
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

    $scope.floorJson = G_FloorJson;

    var editor = new GeoP.SvgEditor("#main", G_FloorJson, $scope, $http, $rootScope);
    editor.loadRooms();

    $scope.editor = editor;

    $scope.mode = 'normal';

    $scope.editModeAction = function() {
      document.location.href = '/floors/' + G_FloorJson.id + '/edit';
    };

    $scope.createPolyline = function() {
      $scope.mode = 'create';
      var opts = editor.createPolyline($scope);
      $scope.currentOptions = opts;
    };

    var createPolyline = {
      label: 'Créer pièce',
      icon: 'fa-pencil',
      action: $scope.createPolyline,
      classes: 'btn-default'
    };

    var mapZoomDefault = {
      label: 'Centrer le plan',
      icon: 'fa-crosshairs',
      action: function() {
        editor.centerMap();
      },
      classes: 'btn-default'
    };


    var editMode = {
      label: 'Modifier le plan',
      icon: 'fa-unlock',
      action: $scope.editModeAction,
      classes: 'btn-default'
    };

    var editModeAdmin = {
      label: 'Modifier l\'étage',
      icon: 'fa-edit',
      action: function() {
        document.location.href = '/admin/floors/' + G_FloorJson.id + '/edit';
      },
      classes: 'btn-default'
    };


    var stopEditMode = {
      label: 'Arrêter la modification',
      icon: 'fa-lock',
      action: function() {
        document.location.href = '/floors/' + G_FloorJson.id;
      },
      classes: 'btn-default'
    };



    var saveToImage = {
      label: 'Sauvegarder l\'étage en image',
      icon: 'fa-picture-o',
      action: function() {
        editor.exportToImage('main');
      },
      classes: 'btn-default'
    };

    $scope.cleanCurrentOptions = function() {
      $scope.currentOptions = [];
      $scope.mode = 'normal';
    };

    switch (G_Mode) {
      case 'edit':
        $scope.buttons = [stopEditMode, createPolyline];
        break;
      case 'show':
        $scope.buttons = [editMode, saveToImage, editModeAdmin, mapZoomDefault];
        break;
    }

    $scope.currentOptions = [];

  });
}());