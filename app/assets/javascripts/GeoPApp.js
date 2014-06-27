(function() {
  var app = angular.module('GeoP', []);

  app.config(["$httpProvider",
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  app.controller('RoomTypesFilterCtrl', function($scope, $rootScope) {

    $scope.roomTypeFilterStateChange = function(roomType, e) {
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

    function loadImage(imageName) {

      function getBlobUrl(canvasdata) {
        var byteString = atob(canvasdata.replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        var dataView = new DataView(ab);
        var blob = new Blob([dataView], {
          type: "image/png"
        });
        var DOMURL = self.URL || self.webkitURL || self;
        var newurl = DOMURL.createObjectURL(blob);
        return newurl;
      }


      var $svgDiv = $('<div id="svgdataurl" style="display:none"></div>');
      var html = d3.select("#main")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr('width', editor.bgBox.w)
        .attr('height', editor.bgBox.h)
        .node().outerHTML;

      var h = html.replace(/²/g, '&#178;');

      var $c = $('<canvas style="display:none"></canvas>');
      $('body').prepend($svgDiv).prepend($c);
      var canvas = $c[0];
      var context = canvas.getContext("2d");

      canvas.style.cssText += 'width:' + editor.bgBox.w + 'px' + ';height:' + editor.bgBox.h + 'px';
      context.canvas.width = editor.bgBox.w;
      context.canvas.height = editor.bgBox.h;

      var imgsrc = 'data:image/svg+xml;base64,' + btoa(h);
      var img = 'svg image <img width="' + editor.bgBox.w + '" height="' + editor.bgBox.h + '" src="' + imgsrc + '"/>';
      d3.select("#svgdataurl").html(img);

      var image = new Image();
      image.src = imgsrc;
      context.drawImage(image, 0, 0);
      image.onload = function() {
        context.fillStyle = 'white';
        context.fillRect(0, 0, image.width, image.height);
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");
        var pngimg = 'png<img src="' + canvasdata + '">';
        d3.select("#svgdataurl").html(pngimg);

        var a = document.createElement("a");
        a.download = imageName + ".png";
        a.href = getBlobUrl(canvasdata);
        a.click();

        $svgDiv.remove();
        $c.remove();

      };

    }

    var saveToImage = {
      label: 'Sauvegarder l\'étage en image',
      action: function() {
        loadImage(editor.getFloorFullName());

        // editor.camera.scale = 2;
        // editor.camera.x = 0;
        // editor.camera.y = 0;
        // editor.applyTransform();
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