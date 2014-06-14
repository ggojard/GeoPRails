var app = angular.module('GeoP', ['angularFileUpload']);

app.config(["$httpProvider",
  function(provider) {
    provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  }
]);

app.controller('GeoPCtrl', function($scope, $upload, $http) {

  $scope.isShift = false;
  $scope.camera = {
    scale: 1,
    x: 0,
    y: 0
  };
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

  var editor = new GeoP.SvgEditor("#main", $scope, $http);
  editor.loadRooms($http);
  $scope.mode = 'normal';

  $scope.applyTransform = function() {
    editor.canvas.transform(["scale(", $scope.camera.scale, ") translate(", $scope.camera.x, ' ', $scope.camera.y, ')'].join(''));
  }


  $scope.createPolyline = function() {
    $scope.mode = 'create';
    var opts = editor.createPolyline($scope);
    $scope.currentOptions = opts;
  };

  var createPolyline = {
    label: 'create polyline',
    action: $scope.createPolyline
  };

  var importBackground = {
    label: 'import background',
    action: function(e) {
      $scope.importBackground = !$scope.importBackground;
    }
  };

  $scope.cleanCurrentOptions = function() {
    $scope.currentOptions = [];
    $scope.mode = 'normal';
  };

  $scope.buttons = [createPolyline, importBackground];
  $scope.currentOptions = [];

  $scope.onFileSelect = function($files) {
    var progress = function(evt) {
    };
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