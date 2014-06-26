(function() {
  var app = angular.module('GeoP', []);

  app.config(["$httpProvider",
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  app.controller('RoomTypesFilterCtrl', function($scope, $rootScope) {
    
    $scope.roomTypeFilterStateChange = function(roomType, e){
      $rootScope.$emit('RoomTypeFilters.StateChange', roomType);
    };

    $rootScope.$on('updateRoomTypes', function(e, roomTypes) {
      $scope.roomTypes = roomTypes;
    });
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

  app.controller('GeoPCtrl', function($scope, $http, $rootScope) {
    $scope.G_Mode = G_Mode;
    $scope.isShift = false;

    function handleKey(ev) {
      var key, isShift;
      if (window.event) {
        key = window.event.keyCode;
        isShift = window.event.shiftKey ? true : false;
      } else {
        key = ev.which;
        isShift = ev.shiftKey ? true : false;
      }
      $scope.isShift = isShift;
      $scope.$apply();
    }


    document.onkeydown = handleKey;
    document.onkeyup = handleKey;

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

    $scope.cleanCurrentOptions = function() {
      $scope.currentOptions = [];
      $scope.mode = 'normal';
    };

    switch (G_Mode) {
      case 'edit':
        $scope.buttons = [stopEditMode, createPolyline];
        break;
      case 'show':
        $scope.buttons = [editMode];
        break;
    }

    $scope.currentOptions = [];

  });
}());