(function() {
  var app = angular.module('GeoP', []).run(function($rootScope) { // instance-injector

    $rootScope.filters = [];
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
    $scope.checkAll = false;


    $scope['filterStateChange'] = function(filter, e) {
      $rootScope.$emit(filterName + '_filters.StateChange', filter);
    };


    $scope.CheckAll = function() {
      // unCheckAllFilters($rootScope);

      for (var key in $scope.filters) {
        if ($scope.filters.hasOwnProperty(key)) {
          var filter = $scope.filters[key];
          filter.state = $scope.checkAll;
          $rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    }
    $rootScope.$on(filterName + '_filters.Update', function(e, filters) {
      $scope.filters = filters;
    });
  }

  app.controller('RoomTypesFilterCtrl', function($scope, $rootScope) {
    registerFilterCtrl($scope, $rootScope, 'room_type');
  });

  app.controller('OrganizationFilterCtrl', function($scope, $rootScope) {
    registerFilterCtrl($scope, $rootScope, 'organization');
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
    $scope.floorJson = G_RootJson;
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

    $scope.floorJson = G_RootJson;

    var editor = new GeoP.SvgEditor("#main", G_RootJson, $scope, $http, $rootScope);
    editor.loadRooms();
    $scope.mode = 'normal';

    $scope.editModeAction = function() {
      document.location.href = '/floors/' + G_RootJson.id + '/edit';
    };

    $scope.createPolyline = function() {
      $scope.mode = 'create';
      var opts = editor.createPolyline($scope);
      $scope.currentOptions = opts;
    };

    var createPolyline = {
      label: 'Créer pièce',
      action: $scope.createPolyline,
      classes: 'btn-default'
    };

    var editMode = {
      label: 'Modifier l\'étage',
      action: $scope.editModeAction,
      classes: 'btn-default'
    };

    var stopEditMode = {
      label: 'Arrêter la modification',
      action: function() {
        document.location.href = '/floors/' + G_RootJson.id;
      },
      classes: 'btn-default'
    };



    var saveToImage = {
      label: 'Sauvegarder l\'étage en image',
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
        $scope.buttons = [editMode, saveToImage];
        break;
    }

    $scope.currentOptions = [];

  });
}());