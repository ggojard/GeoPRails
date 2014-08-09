/*global GeoP:true */

(function(geoP) {
  "use strict";


  var a = Snap;

  var focusOnMouseAfterMouseWheel = function(event) {

    var $svg = $(this.paper.node);
    var paperSize = {
      width: $svg.width(),
      height: $svg.height()
    };


    var translate = new geoP.Point(this.camera.x, this.camera.y);
    var canvasOffset = $(this.paper.node).offset();
    var mousePosition = new geoP.Point();
    mousePosition.set(event.pageX - canvasOffset.left, event.pageY - canvasOffset.top);
    var mp = this.getMousePos(event);
    mousePosition.set(mp.x, mp.y);
    var canvasMousePosition = new geoP.Point();
    canvasMousePosition = mousePosition.getSubPoint(translate);
    var mousePourcentagePosition = new geoP.Point();
    mousePourcentagePosition.set((mousePosition.x) / paperSize.width, (mousePosition.y) / paperSize.height);
    var scaledCanvasMousePosition = {
      "x": (canvasMousePosition.x) * this.camera.scale,
      "y": (canvasMousePosition.y) * this.camera.scale
    };
    var mouseInDrawZone = new geoP.Point();
    mouseInDrawZone.copy(scaledCanvasMousePosition);
    var focusMouseTranslate = new geoP.Point();
    var newMousePourcentageShouldBe, newCanvasPositionShouldBe, oldCanvasPositionShouldBe, newScaledCanvasSize;
    // define the sclaed size of the canvas
    newScaledCanvasSize = new geoP.Point();
    newScaledCanvasSize.set(this.camera.newScale * paperSize.width, this.camera.newScale * paperSize.height);
    // define where the mouse should be in the scaled canvas using % position
    newMousePourcentageShouldBe = mouseInDrawZone.getDivPoint(newScaledCanvasSize);
    var oldMousePourcentageShouldBe = new geoP.Point();
    var oldScaledCanvasSize = new geoP.Point();
    oldScaledCanvasSize.set(this.camera.scale * paperSize.width, this.camera.scale * paperSize.height);
    oldMousePourcentageShouldBe = mouseInDrawZone.getDivPoint(oldScaledCanvasSize);
    // define where the mouse should be after scale
    newCanvasPositionShouldBe = new geoP.Point();
    newCanvasPositionShouldBe.copy(newMousePourcentageShouldBe);
    newCanvasPositionShouldBe.x *= paperSize.width;
    newCanvasPositionShouldBe.y *= paperSize.height;
    // copy the old canvas mouse position %
    oldCanvasPositionShouldBe = new geoP.Point();
    oldCanvasPositionShouldBe.copy(oldMousePourcentageShouldBe);
    // scale it to the canvas size
    oldCanvasPositionShouldBe.x *= paperSize.width;
    oldCanvasPositionShouldBe.y *= paperSize.height;
    focusMouseTranslate.copy(newCanvasPositionShouldBe);
    // substract the new to old position which the translate to do
    focusMouseTranslate.sub(oldCanvasPositionShouldBe);
    // do the translate
    translate.copy(focusMouseTranslate);
    translate.inverse();
    this.camera.x -= translate.x;
    this.camera.y -= translate.y;
    this.camera.scale = this.camera.newScale;

    // var $d = $('#debugger');
    // $d.html('');
    // $d.append('mouse position : ' + mousePosition.toString() + '<br>');
    // $d.append('canvas mouse position : ' + canvasMousePosition.toString() + '<br>');
    // $d.append('mouse % position : ' + mousePourcentagePosition.toString() + '<br>');
    // $d.append('mouse in draw zone : ' + mouseInDrawZone.toString() + '<br>');
    // $d.append('new mouse % pos : ' + oldMousePourcentageShouldBe.toString() + '<br>');
    // $d.append('new mouse pos : ' + newCanvasPositionShouldBe.toString() + '<br>');
    // $d.append('old mouse pos : ' + oldCanvasPositionShouldBe.toString() + '<br>');
    // $d.append('translate : ' + translate.toString() + '<br>');

  };


  function mouseWheel(event) {

    /*jshint validthis:true */
    var zoomFactor = 0.5;
    var zoomFactorMin = 0.25;
    var delta = 0;
    if (!event) /* For IE. */
      event = window.event;
    if (event.wheelDelta) { /* IE/Opera. */
      delta = event.wheelDelta / 120;
    } else if (event.detail) { /** Mozilla case. */
      /** In Mozilla, sign of delta is different than in IE.
       * Also, delta is multiple of 3.
       */
      delta = -event.detail / 3;
    }
    if (this.$scope.isZKeyDown === true) {
      event.preventDefault(event);
      var factor = delta;
      var scaleChange = (factor * zoomFactor);
      var newScale = this.camera.scale + scaleChange;
      if (newScale < zoomFactorMin) {
        newScale = zoomFactorMin;
      }

      this.camera.newScale = newScale;
      focusOnMouseAfterMouseWheel.bind(this)(event);
      this.applyTransform();
      return false;
    }

  }

  function mouseMove(ev) {
    /*jshint validthis:true */
    if (this.$scope.isZKeyDown === true && this.lastMovePosition !== null) {
      var diff = {
        x: this.lastMovePosition.x - ev.clientX,
        y: this.lastMovePosition.y - ev.clientY
      };
      this.camera.x -= diff.x / this.camera.scale;
      this.camera.y -= diff.y / this.camera.scale;
      this.applyTransform();
    }

    this.lastMovePosition = {
      x: ev.clientX,
      y: ev.clientY
    };
  }

  function mouseClick(e) {
    /*jshint validthis:true */
    if (geoP.currentEvent === null && this.$scope.mode !== 'create') {
      this.unSelectItems();
      this.cleanCurrentOptions();
      this.cleanDragPointOptions();
      this.$scope.$apply();
    }
    geoP.currentEvent = null;
  }

  var SvgEditor = function(floorJson, $scope, $http, $rootScope, mapFilter) {
    var that = this;
    this.svgId = 'map-' + floorJson.id;
    this.paper = a('#' + this.svgId);
    if (this.paper === null) {
      return;
    }


    this.mapFilter = mapFilter;

    this.json = floorJson;
    this.$scope = $scope;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.loadCamera();
    this.createPolylineLine = null;
    this.createPolylinePolyline = null;
    this.newPoint = null;
    this.items = [];
    this.canvas = this.paper.g();
    this.lastMovePosition = null;
    this.currentOptions = [];
    this.dragPointsOptions = [];

    var dim = JSON.parse(this.json.image_dimensions);
    if (dim === null) {
      dim = {
        w: 0,
        h: 0
      };
    }
    var bgBox = {
      x: 0,
      y: 0,
      w: dim.w,
      h: dim.h
    };

    this.bgBox = bgBox;

    var border = this.canvas.rect(bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    border.attr({
      fill: 'white',
      stroke: '#ffcf00'
    });

    var imagePath = 'http://' + window.location.host + this.json.image;
    this.bg = this.canvas.image(imagePath, bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    this.bg.node.style.cssText = 'opacity: 0.25';

    this.loadFilters();

    this.applyTransform();

    this.paper.node.addEventListener("mousewheel", mouseWheel.bind(this), false);
    this.paper.node.addEventListener("DOMMouseScroll", mouseWheel.bind(this), false);

    this.paper.mousemove(mouseMove.bind(this));
    this.paper.click(mouseClick.bind(this));

    this.mapScale = new geoP.MapScale(this);
    this.mapScale.loadFromFloor(this.json);
    this.$scope.mapScale = this.mapScale;

    switch ($scope.G_Mode) {
      case 'show':
        this.mapScale.hide();
        break;
    }

    if (this.camera.scale === geoP.DefaultCamera.scale) {
      this.centerMap();
    }

  };

  SvgEditor.prototype.cleanDragPointOptions = function() {
    this.dragPointsOptions = [];
  };

  SvgEditor.prototype.removePolyline = function(p) {

  };

  SvgEditor.prototype.cleanCurrentOptions = function() {
    this.currentOptions = [];
    this.$scope.mode = 'normal';
  };

  SvgEditor.prototype.getFloorFullName = function() {
    var n = this.json.building.name + '-' + this.json.name;
    n = n.replace(/ /g, '_');
    return n;
  };


  SvgEditor.prototype.getMousePos = function(e) {
    if (e.hasOwnProperty('offsetX')) {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    } else {
      var targetOffset = $(this.paper.node).parent().offset();
      var st = $(window).scrollTop();
      var sl = $(window).scrollLeft();
      var yVal = e.clientY + st - targetOffset.top;
      var xVal = e.clientX + sl - targetOffset.left;
      return {
        x: xVal,
        y: yVal
      };
    }
  };


  SvgEditor.prototype.drag = function(e, node, moveMethod) {
    var scale = this.camera.scale;
    var tX = -this.camera.x;
    var tY = -this.camera.y;
    var mousePos = this.getMousePos(e);

    if (mousePos.x < 0 || mousePos.y < 0) {
      return;
    }
    var mx = (mousePos.x / scale) - node.cx.baseVal.value;
    var my = (mousePos.y / scale) - node.cy.baseVal.value;

    var ctm = this.canvas.node.getCTM();
    mx -= ctm.e / scale;
    my -= ctm.f / scale;

    node.cx.baseVal.value += mx;
    node.cy.baseVal.value += my;

    return moveMethod(mx, my);
  };


  SvgEditor.prototype.centerOnBox = function(boxSize) {
    var $svg = $(this.paper.node);
    var paperSize = {
      w: $svg.width(),
      h: $svg.height()
    };

    // this.camera.scale = 1;this.camera.x = 0;this.camera.y = 0;this.applyTransform();

    var ratioW = paperSize.w / boxSize.w;
    var ratioH = paperSize.h / boxSize.h;

    // use the minimun scale ratio
    var ratio = ratioH;
    if (ratioW < ratioH) {
      ratio = ratioW;
    }

    this.camera.scale = ratio;

    var scaledWidth = boxSize.w * ratio;
    var scaledHeight = boxSize.h * ratio;

    this.camera.x = ((paperSize.w - scaledWidth) / 2) * 1 / ratio - boxSize.x;
    this.camera.x *= ratio;
    this.camera.y = ((paperSize.h - scaledHeight) / 2) * 1 / ratio - boxSize.y;
    this.camera.y *= ratio;

    this.applyTransform();
  };

  SvgEditor.prototype.centerMap = function() {
    this.centerOnBox(this.bgBox);
  };

  SvgEditor.prototype.createRoomFromJson = function(json) {
    var b = new geoP.Polyline(this);
    b.loadFromJson(json);
    this.items.push(b);
  };

  SvgEditor.prototype.updateBelongsToAvailable = function(belongsToNameList, belongsToKeyName) {
    var floorJson = this.json;
    if (this.mapFilter.filters[belongsToKeyName] === void 0) {
      this.mapFilter.filters[belongsToKeyName] = {};
    }
    var itemsObject = this.mapFilter.filters[belongsToKeyName];
    for (var i = 0; i < floorJson[belongsToNameList].length; i++) {
      var item = floorJson[belongsToNameList][i];
      if (item[belongsToKeyName] !== null) {
        var targetItem = item[belongsToKeyName];
        if (itemsObject[targetItem.id] === void 0) {
          itemsObject[targetItem.id] = targetItem;
          itemsObject[targetItem.id].state = false;
          itemsObject[targetItem.id].count = 0;
          itemsObject[targetItem.id].areaSum = 0;
          itemsObject[targetItem.id].nbPeople = 0;
        } else {}
        itemsObject[targetItem.id].count += 1;
        itemsObject[targetItem.id].areaSum += item.area;
        itemsObject[targetItem.id].areaSum = parseFloat(itemsObject[targetItem.id].areaSum.toFixed(1), 10)
        itemsObject[targetItem.id].nbPeople += item.affectations.length;
        if (itemsObject[targetItem.id].nbPeople === 0) {
          itemsObject[targetItem.id].ratio = 0;
        } else {
          itemsObject[targetItem.id].ratio = parseFloat(itemsObject[targetItem.id].areaSum / itemsObject[targetItem.id].nbPeople, 10).toFixed(1);
        }

      }
    }
  }

  SvgEditor.prototype.loadBelongsToFilter = function(belongsToNameList, belongsToKeyName) {
    var that = this;
    this.updateBelongsToAvailable(belongsToNameList, belongsToKeyName);
    this.$rootScope.$emit(belongsToKeyName + '_filters.Update', this.mapFilter.filters[belongsToKeyName]);
  };


  SvgEditor.prototype.setOptions = function() {

    var $scope = this.$scope;
    var that = this;

    var createPolyline = {
      label: 'Créer pièce',
      icon: 'fa-pencil',
      action: function() {
        $scope.mode = 'create';
        var opts = that.createPolyline($scope);
        that.currentOptions = opts;
      },
      classes: 'btn-success'
    };

    var mapZoomDefault = {
      label: 'Centrer le plan',
      icon: 'fa-crosshairs',
      action: function() {
        that.centerMap();
      },
      classes: 'btn-default'
    };


    var editMode = {
      label: 'Modifier le plan',
      icon: 'fa-unlock',
      action: function() {
        document.location.href = '/floors/' + that.json.id + '/edit';
      },
      classes: 'btn-default'
    };

    var editModeAdmin = {
      label: 'Modifier l\'étage',
      icon: 'fa-edit',
      action: function() {
        document.location.href = '/admin/floors/' + that.json.id + '/edit';
      },
      classes: 'btn-default'
    };


    var stopEditMode = {
      label: 'Arrêter la modification',
      icon: 'fa-lock',
      action: function() {
        document.location.href = '/floors/' + that.json.id;
      },
      classes: 'btn-default'
    };

    var saveToImage = {
      label: 'Sauvegarder l\'étage en image',
      icon: 'fa-picture-o',
      action: function() {
        that.exportToImage();
      },
      classes: 'btn-default'
    };


    switch (this.$scope.G_Mode) {
      case 'edit':
        this.buttonOptions = [stopEditMode, createPolyline, mapZoomDefault];
        break;
      case 'show':
        this.buttonOptions = [editMode, saveToImage, editModeAdmin, mapZoomDefault];
        break;
    }
  };


  SvgEditor.prototype.loadFilters = function() {
    var that = this;
    var filtersNames = GeoP.filtersNames;
    for (var i = 0; i < filtersNames.length; i++) {
      (function(filterName) {
        that.loadBelongsToFilter('rooms', filterName);
      }(filtersNames[i].name));
    }
  };

  SvgEditor.prototype.mapOnItems = function(methodName, a1, a2) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].element !== void 0) {
        this.items[i][methodName](a1, a2);
      }
    }
  };

  SvgEditor.prototype.loadRooms = function() {
    var that = this;
    for (var i = 0; i < this.json.rooms.length; i++) {
      var r = this.json.rooms[i];
      that.createRoomFromJson(r);
    }
  };

  SvgEditor.prototype.unSelectItems = function() {
    this.mapOnItems('unSelect');
  };

  SvgEditor.prototype.createPolylineMode = function(e) {
    var scale = this.camera.scale;
    var tX = -this.camera.x / scale;
    var tY = -this.camera.y / scale;

    if (this.createPolylinePolyline === null) {
      this.createPolylinePolyline = new geoP.Polyline(this);

      var mouse = this.getMousePos(e);

      this.createPolylinePolyline.create(mouse.x / scale + tX, mouse.y / scale + tY);
    } else {
      this.createPolylinePolyline.appendPoint(this.newPoint.x, this.newPoint.y);
    }
  };

  function toDeg(rad) {
    return rad * 180 / Math.PI;
  }

  function getAngle(cx, cy, ex, ey) {
    var dx = ex - cx;
    var dy = ey - cy;
    var theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI; // rads to degs
    return theta;
  }

  function v2(angle, power) {
    var x = Math.sin(angle);
    var y = Math.cos(angle);
    x *= power;
    y *= power;
    return {
      x: x,
      y: y
    };
  }

  function power(v) {
    return v * v;
  }

  function hyp(newPoint, lastPoint) {
    var pow = power(newPoint.x - lastPoint.x) + power(newPoint.y - lastPoint.y);
    var sqrt = Math.sqrt(pow);
    return sqrt;
  }

  function updateNewPointFromAngle(a, newPoint, lastPoint) {
    var v = v2(a, hyp(newPoint, lastPoint));
    newPoint.x = lastPoint.x + v.x;
    newPoint.y = lastPoint.y + v.y;
  }

  function updateNewPositionIfShift($scope, newPoint, lastPoint) {
    if ($scope.isShift === true) {
      var a = getAngle(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
      if ((a > -22.5 && a < 22.5) || (a < -157.5 || a > 157.5)) {
        newPoint.y = lastPoint.y;
      } else if (a >= 22.5 && a < 67.5) {
        updateNewPointFromAngle(Math.PI / 4, newPoint, lastPoint);
      } else if ((a >= 67.5 && a < 112.5) || (a > -112.5 && a < -67.5)) {
        newPoint.x = lastPoint.x;
      } else if (a > 112.5 && a < 157.5) {
        updateNewPointFromAngle(Math.PI * 7 / 4, newPoint, lastPoint);
      } else if (a < -22.5 && a > -67.5) {
        updateNewPointFromAngle(Math.PI * 3 / 4, newPoint, lastPoint);
      } else if (a < -112.5 && a > -157.5) {
        updateNewPointFromAngle(Math.PI * 5 / 4, newPoint, lastPoint);
      }
    }
  }

  SvgEditor.prototype.drawToMousePosition = function(e) {
    var scale = this.camera.scale;
    var tX = -this.camera.x / scale;
    var tY = -this.camera.y / scale;
    var mousePos = this.getMousePos(e);

    this.newPoint = {
      x: mousePos.x / scale + tX,
      y: mousePos.y / scale + tY
    };

    if (this.createPolylinePolyline !== null) {
      var lastPoint = this.createPolylinePolyline.getLastPoint();
      if (lastPoint !== null) {
        if (this.createPolylineLine === null) {
          this.createPolylineLine = this.canvas.line(lastPoint.x, lastPoint.y, this.newPoint.x, this.newPoint.y);
          this.createPolylineLine.attr({
            stroke: 'orange',
            'stroke-dasharray': [5, 5]
          });
        } else {
          updateNewPositionIfShift(this.$scope, this.newPoint, lastPoint);
          this.createPolylineLine.animate({
            x1: lastPoint.x,
            y1: lastPoint.y,
            x2: this.newPoint.x,
            y2: this.newPoint.y
          }, 5);
        }
      }
    }
  };


  SvgEditor.prototype.createPolyline = function($scope) {
    var that = this;

    var createMode = this.createPolylineMode.bind(this);
    var move = this.drawToMousePosition.bind(this);
    this.paper.click(createMode);
    this.paper.mousemove(move);

    function finishCreateMode() {
      that.paper.unclick(createMode);
      that.paper.unmousemove(move);
      if (that.createPolylineLine !== null) {
        that.createPolylineLine.remove();
      }
      that.createPolylinePolyline = null;
      that.createPolylineLine = null;
      that.cleanCurrentOptions();
    }

    function cancelCurrentPolyline() {
      if (that.createPolylinePolyline !== null) {
        that.createPolylinePolyline.remove();
      }
      finishCreateMode();
    }

    return [{
      label: 'Fermer',
      classes: 'btn-success',
      action: function() {
        if (that.createPolylinePolyline !== null) {
          that.createPolylinePolyline.close($scope);
          that.createPolylinePolyline.save();
          that.items.push(that.createPolylinePolyline);
        }
        finishCreateMode();
      }
    }, {
      label: 'Annuler',
      classes: 'btn-warning',
      action: cancelCurrentPolyline
    }];
  };


  geoP.SvgEditor = SvgEditor;

}(GeoP));