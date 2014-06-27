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
    // var svg = '<svg><rect x="0" y="0" width="100" height="100" fill="red" /></svg>';
    // var svg = '<svg><polygon points="697 51 697.952 140.952 823.143 142.286 824.333 50.4762" fill="#26a3eb" stroke="#0b6aff"></polygon></svg>';



    // var svg = '<svg><g transform="matrix(0.71,0,0,0.71,208.4038,-5.275)"><image xlink:href="/system/floors/images/000/000/001/original/plan1.jpg?1403553804" preserveAspectRatio="none" x="0" y="0" width="891" height="779" class="bg"></image><rect x="0" y="0" width="891" height="779" fill="rgba(0,0,0,0)" stroke="#ffcf00"></rect><line x1="599" x2="678" y1="28" y2="17" stroke="#ff0000" style="visibility: hidden;"></line><circle cx="599" cy="28" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="678" cy="17" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><g><polygon points="384.44 97.9267 492 86.0001 491.471 153.941 385.266 153.031" fill="#26a3eb" stroke="#0b6aff"></polygon><circle cx="384.4403358447473" cy="97.92665494151876" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="491.9999671924036" cy="86.00004971690939" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="491.4705482470911" cy="153.94122708507345" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="385.2663551318567" cy="153.03061307140158" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><text x="418.50140380859375" y="119.97063827514648">B-124</text><text x="417.79046630859375" y="135.73626327514648">3.7 m²</text></g><g><polygon points="491.939 212.454 492.166 271.577 624.454 273.19 624.454 213.681" fill="#26a3eb" stroke="#0b6aff"></polygon><circle cx="491.93862688919216" cy="212.45404446788595" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="492.1656166352859" cy="271.5767403907375" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="624.4539467134109" cy="273.19023526378436" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="624.4539467134109" cy="213.6810342139797" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><text x="524.3915863037109" y="242.8221435546875">B-KAMBIZ</text><text x="537.7665863037109" y="258.5877685546875">4.5 m²</text></g><g><polygon points="639.411 211.972 754.341 211.683 753.122 272.659 640.346 271.785" fill="#26a3eb" stroke="#0b6aff"></polygon><circle cx="639.4111611265193" cy="211.9719887750036" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="754.3414589780818" cy="211.6829720513708" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="753.1219155210506" cy="272.65858850644895" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="640.3457314390193" cy="271.7850838677771" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><text x="677.1575317382812" y="242.17078399658203">B-126</text><text x="676.4465942382812" y="257.93640899658203">3.9 m²</text></g><g><polygon points="697 51 697.952 140.952 823.143 142.286 824.333 50.4762" fill="#26a3eb" stroke="#0b6aff"></polygon><circle cx="696.9999673653226" cy="51.000049543990414" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="697.9523599434476" cy="140.95242686332634" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="823.1428506661039" cy="142.2857703691857" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="824.3332803536039" cy="50.47623820365838" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><text x="740.9478454589844" y="96.38100051879883">B-125</text><text x="740.2369079589844" y="112.14662551879883">6.5 m²</text></g><g><polygon points="255.238 160.381 254.805 204.666 212.381 205.619 212.571 271.041 295.837 270.633 294.524 152.048" fill="#1dc8fe" stroke="#0b6aff"></polygon><circle cx="255.23806536575466" cy="160.38100064464376" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="254.80541766067654" cy="204.6655770606594" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="212.3809181489578" cy="205.619098789175" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="212.57139361282498" cy="271.0408517188625" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="295.83669817825466" cy="270.63270962901873" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><circle cx="294.5237709321609" cy="152.04767239757345" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)" style="visibility: hidden;"></circle><text x="244.9525604248047" y="211.5442657470703">B?</text><text x="233.6791229248047" y="227.3098907470703">4.2 m²</text></g></g></svg>';
    // var ctx = document.getElementById(cId).getContext('2d');
    // ctx.canvas.width = 3000;
    // ctx.canvas.height = 3000;
    // svg = '<svg>' + svg + '</svg>';

    // ctx.drawSvg(svg, 0, 0, 3000, 3000);



    // var h = '<svg id="main" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>Created with Snap</desc><defs></defs><g transform="matrix(0.71,0,0,0.71,208.4038,1.825)"><rect x="0" y="0" width="891" height="779" fill="rgba(0,0,0,0)" stroke="#ffcf00"></rect><line x1="599" x2="678" y1="28" y2="17" stroke="#ff0000"></line><circle cx="599" cy="28" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle><circle cx="678" cy="17" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle><g><polygon points="384.44 97.9267 492 86.0001 491.471 153.941 385.266 153.031" fill="#26a3eb" stroke="#0b6aff"></polygon><text x="418.50140380859375" y="119.97063827514648">B-124</text><text x="417.79046630859375" y="135.73626327514648">3.7 m²</text></g><g><polygon points="491.939 212.454 492.166 271.577 624.454 273.19 624.454 213.681" fill="#26a3eb" stroke="#0b6aff"></polygon><text x="524.3915863037109" y="242.8221435546875">B-KAMBIZ</text><text x="537.7665863037109" y="258.5877685546875">4.5 m²</text></g><g><polygon points="639.411 211.972 754.341 211.683 753.122 272.659 640.346 271.785" fill="#26a3eb" stroke="#0b6aff"></polygon><text x="677.1575317382812" y="242.17078399658203">B-126</text><text x="676.4465942382812" y="257.93640899658203">3.9 m²</text></g><g><polygon points="697 51 697.952 140.952 823.143 142.286 824.333 50.4762" fill="#26a3eb" stroke="#0b6aff"></polygon><text x="740.9478454589844" y="96.38100051879883">B-125</text><text x="740.2369079589844" y="112.14662551879883">6.5 m²</text></g><g><polygon points="255.238 160.381 254.805 204.666 212.381 205.619 212.571 271.041 295.837 270.633 294.524 152.048" fill="#28e07b" stroke="#0b6aff"></polygon><text x="244.9525604248047" y="211.5442657470703">B?</text><text x="233.6791229248047" y="227.3098907470703">4.2 m²</text></g></g></svg>';



    // var h = '<svg id="main" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>Created with Snap</desc><defs></defs><text x="20" y="20" fill="red">600</text><g transform="matrix(0.71,0,0,0.71,208.4038,1.825)"><text x="200" y="200" fill="red">600</text><rect x="0" y="0" width="891" height="779" fill="rgba(255,0,0,0)" stroke="#ffcf00"></rect><line x1="599" x2="678" y1="28" y2="17" stroke="#ff0000"></line><circle cx="599" cy="28" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle><circle cx="678" cy="17" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle></g></svg>';


    // var h = '<svg id="main" version="1.1" xmlns="http://www.w3.org/2000/svg"><text x="20" y="20" fill="red" style="font-size:24px" stroke="blue">600 e text est tres long</text><circle cx="678" cy="17" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle></svg>';



    function loadImage() {

      $('body').prepend('<br/><br/><br/><br/><div id="svgdataurl"></div><div id="pngdataurl"></div>');

      var html = d3.select("#main")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr('width', editor.bgBox.w)
        .attr('height', editor.bgBox.h)
        // .attr('ng-class', '')
        .node().outerHTML;

      var h = html.replace(/²/g, '&#178;');
      // var h = '<svg id="main" version="1.1" xmlns="http://www.w3.org/2000/svg"><text x="20" y="20" fill="red" style="font-size:24px" stroke="blue">600 e text est tres long</text><circle cx="678" cy="17" r="5" stroke="#ff0000" fill="rgba(0,0,0,0)"></circle></svg>';
      var canvas = document.querySelector("canvas");

      // var cSize =
      var context = canvas.getContext("2d");


      canvas.style.cssText = 'width:' + editor.bgBox.w + 'px' + ';height:' + editor.bgBox.h + 'px';
      context.canvas.width = editor.bgBox.w;
      context.canvas.height = editor.bgBox.h;

      // context.fillStyle = 'red';
      // context.fillRect(0, 0, editor.bgBox.w, editor.bgBox.h);

      // var opts = {
      //   ignoreMouse: true,
      //   ignoreAnimation: true
      // };

      // opts.scaleWidth = 2;
      // opts.scaleHeight = 2;
      // canvg(canvas, h, opts);


      // return;

      // var h = html;
      // console.log(h);
      var imgsrc = 'data:image/svg+xml;base64,' + btoa(h);
      var img = 'svg image <img width="' + editor.bgBox.w + '" height="' + editor.bgBox.h + '" src="' + imgsrc + '"/>';
      d3.select("#svgdataurl").html(img);


      // var cId = '#canvas-' + 0;
      // var $c = $('<canvas id="' + cId + '"></canvas>');

      // var $c = $(cId);
      // $('body').prepend('<br/><br/><br/><br/>');

      // var canvas = $c[0];
      // var canvas = document.querySelector("canvas");


      // $c.css('width', editor.bgBox.w + 'px');
      // $c.css('height', editor.bgBox.h + 'px');



      // setTimeout(function() {



      // }, 250);


      // return;






      var image = new Image();
      // image.width = editor.bgBox.w;
      // image.height = editor.bgBox.h;
      image.src = imgsrc;
      context.drawImage(image, 0, 0);
      image.onload = function() {
        console.log(image.width, image.height);
        // context.drawImage(image, 0, 0, editor.bgBox.w, editor.bgBox.h, 0, 0, 2000, 1000);
        context.fillStyle = 'white';
        context.fillRect(0, 0, image.width, image.height);
        context.drawImage(image, 0, 0);

        var canvasdata = canvas.toDataURL("image/png");
        var pngimg = 'png<img src="' + canvasdata + '">';
        d3.select("#pngdataurl").html(pngimg);



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
      // binaryblob();

        var a = document.createElement("a");
        a.download = "s2.png";
        a.href = getBlobUrl(canvasdata);
        a.click();


        // $('body').prepend('<img src="' + this.src + '"/>');

        // setTimeout(function(){
        //   // context.drawImage(image, 0, 0);
        // }, 1000);

        return;
      };

    }
    loadImage();

    var saveToImage = {
      label: 'Sauvegarder image',
      action: function() {

        // editor.camera.scale = 2;
        // editor.camera.x = 0;
        // editor.camera.y = 0;
        // editor.applyTransform();

        // var svg = editor.paper.node.innerHTML;
        // var c =document.getElementById(cId)
        // console.log('svg', svg);
        // canvg($c[0], svg, { ignoreMouse: true, ignoreAnimation: true });
        // var svg = '<svg><polygon points="697 51 697.952 140.952 823.143 142.286 824.333 50.4762" fill="#26a3eb" stroke="#0b6aff"></polygon></svg>';
        // canvg(c, , { ignoreMouse: true, ignoreAnimation: true });
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