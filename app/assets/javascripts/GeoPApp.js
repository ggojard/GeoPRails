(function() {
  var app = angular.module('GeoP', ['angularFileUpload']);

  app.config(["$httpProvider",
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  app.controller('RootCtrl', function($scope) {
    $scope.root = G_RootJson;
  });

  app.controller('GlobalCtrl', function($scope) {
    $scope.company = G_Company;
  });

  app.controller('CompanyCtrl', function($scope, $http) {
    $scope.company = G_Company;
  });

  app.controller('GeoPCtrl', function($scope, $upload, $http) {

    $scope.v = 5;

    $scope.G_Mode = G_Mode;

    $scope.isShift = false;
    $scope.importBackground = false;
    $scope.importBackgroundImage = null;

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

    var editor = new GeoP.SvgEditor("#main", G_RootJson, $scope, $http);
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
      action: function(){
        document.location.href = '/floors/' + G_RootJson.id;
      },
      classes: 'btn-default'
    };

    var importBackground = {
      label: 'Importer image',
      classes: 'btn-default',
      action: function(e) {
        $scope.importBackground = !$scope.importBackground;
      }
    };

    $scope.cleanCurrentOptions = function() {
      $scope.currentOptions = [];
      $scope.mode = 'normal';
    };


    switch (G_Mode){
      case 'edit' :
        $scope.buttons = [stopEditMode, createPolyline, importBackground];
      break;
      case 'show':
        $scope.buttons = [editMode];
      break;
    }

    
    $scope.currentOptions = [];

    $scope.onFileSelect = function($files) {
      var progress = function(evt) {};
      var success = function(data, status, headers, config) {
        $scope.importBackgroundImage = '/assets/' + data;
        $scope.importBackground = false;
        editor.bg.animate({
          'src': $scope.importBackgroundImage
        });
      };

      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: 'upload',
          file: file
        }).progress(progress).success(success);
      }
    };
  });
}());