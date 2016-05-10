/*global GeoP, Snap, jQuery, gon */

(function (geoP, $) {
  'use strict';

  var snap = Snap,
    SvgEditor, localId = 0;

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

  function mouseClick() {
    /*jslint browser:true*/
    /*jshint validthis:true */
    var that = this,
      hash;
    if (geoP.currentEvent === null && this.$scope.mapMode !== 'create') {
      this.$scope.$apply(function () {
        // remove rId & itemId if exists
        hash = document.location.hash;
        hash = hash.replace(/\?rId=[0-9]*/, '');
        hash = hash.replace(/\?itemId=[0-9]*/, '');
        document.location.hash = hash;

        that.unSelectItems();
        that.cleanCurrentOptions();
        that.cleanDragPointOptions();
      });
    }
    geoP.currentEvent = null;
  }

  SvgEditor = function (floorJson, mapFilter, $scope, dom) {
    var that = this;

    this.mapFilter = mapFilter;
    this.json = floorJson;
    this.$scope = $scope;
    this.$rootScope = this.mapFilter.$rootScope;
    this.$http = this.mapFilter.$http;
    this.createPolylineLine = null;
    this.createPolylinePolyline = null;
    this.newPoint = null;
    this.items = [];
    this.itemsById = {};
    this.lastMovePosition = null;
    this.currentOptions = [];
    this.dragPointsOptions = [];
    this.isFullscreen = false;
    this.$rootScope.$on('FBFullscreen.change', function (e, isFullscreen) {
      /*jslint unparam:true*/
      that.isFullscreen = isFullscreen;
      that.setOptions();
    });

    this.localId = localId;
    localId += 1;

    this.svgId = 'map-' + floorJson.id;
    this.$scope.editor = this;

    this.paper = snap(dom);
    if (this.paper === null) {
      return;
    }

    this.displayProperties = geoP.displayNames.getDisplayNames(floorJson.building_id);
    this.loadCamera();
    this.canvas = this.paper.g();
    this.canvas.node.id = 'viewport-' + floorJson.id;
    $((function () {
      $(dom).svgPan(that.canvas.node.id, that);
    }()));
    this.setBackgroundImage();
    this.applyTransform();

    this.paper.mousemove(mouseMove.bind(this));
    this.paper.click(mouseClick.bind(this));

    this.mapScale = new geoP.MapScale(this);
    this.mapScale.loadFromFloor(this.json);
    this.$scope.mapScale = this.mapScale;

    this.updateMapScaleVisibility();

    if (this.camera.scale === geoP.DefaultCamera.scale) {
      this.centerMap();
    }
  };

  SvgEditor.prototype.selectPolyline = function (roomId) {
    if (this.itemsById[roomId]) {
      this.$scope.roomId = roomId;
      this.itemsById[roomId].selectPolyline();
      return this.itemsById[roomId];
    }
    return null;
  };

  SvgEditor.prototype.updateDisplayNames = function (displayNames) {
    this.displayProperties = displayNames;
    this.mapOnItems('removeDisplayTexts');
    this.mapOnItems('setTexts');
  };

  SvgEditor.prototype.setBackgroundImage = function () {
    var imagePath, image, dim, bgBox, border, that = this;

    dim = JSON.parse(this.json.image_dimensions);
    if (dim === null) {
      dim = {
        w: 0,
        h: 0
      };
    }
    bgBox = {
      x: 0,
      y: 0,
      w: dim.w,
      h: dim.h
    };

    this.bgBox = bgBox;

    imagePath = '//' + window.location.host + '/floors/images/' + this.json.id + '?style=original';
    image = new Image();
    image.src = imagePath;

    image.onload = function () {
      that.bg = that.paper.image(image.src, bgBox.x, bgBox.y, bgBox.w, bgBox.h);
      that.bg.node.style.cssText = 'opacity: ' + that.json.background_opacity;
      that.canvas.prepend(that.bg);

      border = that.paper.rect(bgBox.x, bgBox.y, bgBox.w, bgBox.h);
      border.attr({
        fill: 'white',
        stroke: '#ffcf00'
      });
      that.canvas.prepend(border);
    };
  };

  SvgEditor.prototype.updateMapScaleVisibility = function () {
    switch (this.$scope.mapMode) {
      case 'show':
        this.mapScale.hide();
        break;
      case 'edit':
        this.mapScale.show();
        break;
    }
  };

  SvgEditor.prototype.setCurrentRoom = function (polyline) {
    this.$scope.room = polyline;
  };

  SvgEditor.prototype.updateCamera = function () {
    var ctm = this.canvas.node.getCTM();
    this.camera.x = ctm.e;
    this.camera.y = ctm.f;
    this.camera.scale = ctm.d;
  };

  SvgEditor.prototype.cleanDragPointOptions = function () {
    this.dragPointsOptions = [];
  };

  SvgEditor.prototype.removePolyline = function (polyline) {
    var index = this.items.indexOf(polyline);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    if (polyline.json !== null && this.itemsById[polyline.json.id] !== undefined) {
      delete this.itemsById[polyline.json.id];
    }

  };

  SvgEditor.prototype.cleanCurrentOptions = function () {
    this.currentOptions = [];
    if (this.$scope.mapMode === 'create') {
      this.$scope.mapMode = 'edit';
    }
  };

  SvgEditor.prototype.getFloorFullName = function () {
    var n = this.json.building.name + '-' + this.json.name;
    n = n.replace(/ /g, '_');
    return n;
  };

  SvgEditor.prototype.getMousePos = function (e) {
    if (e.hasOwnProperty('offsetX')) {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
    var targetOffset, st, sl, yVal, xVal;
    targetOffset = $(this.paper.node).parent().offset();
    st = $(window).scrollTop();
    sl = $(window).scrollLeft();
    yVal = e.clientY + st - targetOffset.top;
    xVal = e.clientX + sl - targetOffset.left;
    return {
      x: xVal,
      y: yVal
    };
  };

  SvgEditor.prototype.drag = function (e, node, moveMethod) {
    var scale, mousePos, mx, my, ctm;
    scale = this.camera.scale;
    mousePos = this.getMousePos(e);

    if (mousePos.x < 0 || mousePos.y < 0) {
      return;
    }
    mx = (mousePos.x / scale) - node.cx.baseVal.value;
    my = (mousePos.y / scale) - node.cy.baseVal.value;

    ctm = this.canvas.node.getCTM();
    mx -= ctm.e / scale;
    my -= ctm.f / scale;

    node.cx.baseVal.value += mx;
    node.cy.baseVal.value += my;

    return moveMethod(mx, my);
  };


  SvgEditor.prototype.centerOnBox = function (boxSize) {
    var $svg, paperSize, ratioW, ratioH, ratio, scaledWidth, scaledHeight;
    $svg = $(this.paper.node);
    paperSize = {
      w: $svg.width(),
      h: $svg.height()
    };

    ratioW = paperSize.w / boxSize.w;
    ratioH = paperSize.h / boxSize.h;

    // use the minimun scale ratio
    ratio = ratioH;
    if (ratioW < ratioH) {
      ratio = ratioW;
    }

    this.camera.scale = ratio;

    scaledWidth = boxSize.w * ratio;
    scaledHeight = boxSize.h * ratio;

    this.camera.x = ((paperSize.w - scaledWidth) / 2) / ratio - boxSize.x;
    this.camera.x *= ratio;
    this.camera.y = ((paperSize.h - scaledHeight) / 2) / ratio - boxSize.y;
    this.camera.y *= ratio;

    this.camera.x = -boxSize.x * ratio;
    this.camera.y = -boxSize.y * ratio;


    this.applyTransform();
  };

  SvgEditor.prototype.centerMap = function () {
    var box = JSON.parse(JSON.stringify(this.bgBox));
    box.w += 300;
    this.centerOnBox(box);
    this.camera.x = 0;
    this.camera.y = 0;
    this.applyTransform();
  };

  SvgEditor.prototype.createRoomFromJson = function (json) {
    var b = new geoP.Polyline(this);
    b.json = json;
    b.createInPaper();
    this.items.push(b);
    this.itemsById[b.json.id] = b;
  };

  SvgEditor.prototype.setOptionsForFullScreen = function () {
    var goToFullScreenMode, stopFullScreenMode, that = this;
    goToFullScreenMode = {
      label: geoP.i18n.ui.map_options.go_fullscreen_mode,
      icon: 'fa-arrows-alt',
      action: function () {
        that.isFullscreen = true;
        that.setOptions();
      },
      classes: 'btn-default'
    };
    stopFullScreenMode = {
      label: geoP.i18n.ui.map_options.stop_fullscreen_mode,
      icon: 'fa-compress',
      action: function () {
        that.isFullscreen = false;
        that.setOptions();
      },
      classes: 'btn-default'
    };
    if (that.isFullscreen === true) {
      this.mapOptions.push(stopFullScreenMode);
    } else {
      this.mapOptions.push(goToFullScreenMode);
    }
  };


  SvgEditor.prototype.setOptions = function () {
    var $scope = this.$scope,
      that = this,
      createPolyline, mapZoomDefault, editMode, editModeAdmin, stopEditMode, saveToImage, options;

    createPolyline = {
      label: geoP.i18n.ui.map_options.create_room,
      icon: 'fa-pencil',
      action: function () {
        $scope.mapMode = 'create';
        that.unSelectItems();
        var opts = that.createPolyline();
        that.currentOptions = opts;
        that.setOptions();
      },
      classes: 'btn-success'
    };

    mapZoomDefault = {
      label: geoP.i18n.ui.map_options.center_map,
      icon: 'fa-crosshairs',
      action: function () {
        that.centerMap();
      },
      classes: 'btn-default'
    };

    editMode = {
      label: geoP.i18n.ui.map_options.edit_map,
      icon: 'fa-unlock',
      action: function (e) {
        that.unSelectItems();
        $scope.mapMode = 'edit';
        that.setOptions();
        that.updateMapScaleVisibility();
        var polyline = geoP.selectPolylineIfIsInRouteParams($scope, that.json.building.id);
        if (polyline !== null) {
          polyline.select(e);
        }
      },
      classes: 'btn-default'
    };

    editModeAdmin = {
      label: geoP.i18n.ui.map_options.edit_floor,
      icon: 'fa-edit',
      action: function () {
        document.location.href = '/admin/floors/' + that.json.id + '/edit';
      },
      classes: 'btn-default'
    };

    stopEditMode = {
      label: geoP.i18n.ui.map_options.stop_edit_map,
      icon: 'fa-lock',
      action: function (e) {
        that.unSelectItems();
        that.cancelCreateMode();
        that.mapOnItems('resetActions');
        $scope.mapMode = 'show';
        that.setOptions();
        that.updateMapScaleVisibility();
        var polyline = geoP.selectPolylineIfIsInRouteParams($scope, that.json.building.id);
        if (polyline !== null) {
          polyline.select(e);
        }
      },
      classes: 'btn-warning'
    };

    saveToImage = {
      label: geoP.i18n.ui.map_options.save_map_as_image,
      icon: 'fa-picture-o',
      action: function () {
        that.exportToImage();
      },
      classes: 'btn-default'
    };

    this.mapOptions = [mapZoomDefault];
    switch (this.$scope.mapMode) {
      case 'create':
        this.mapOptions.push(stopEditMode);
        break;
      case 'edit':
        this.mapOptions = this.mapOptions.concat([stopEditMode, createPolyline]);
        break;
      case 'show':
        options = [saveToImage];
        if (this.$rootScope.userType !== 'READ') {
          options.push(editMode, editModeAdmin);
        }
        this.mapOptions = this.mapOptions.concat(options);
        break;
    }
    this.setOptionsForFullScreen();
  };

  // a1..N ... are facultatif
  SvgEditor.prototype.mapOnItems = function (methodName, a1, a2) {
    var i = 0;
    for (i = 0; i < this.items.length; i += 1) {
      if (this.items[i].element !== undefined) {
        this.items[i][methodName](a1, a2);
      }
    }
  };

  SvgEditor.prototype.createRoomsPolylines = function () {
    var that = this,
      i, r;
    for (i = 0; i < this.json.rooms.length; i += 1) {
      r = this.json.rooms[i];
      that.createRoomFromJson(r);
    }
  };

  SvgEditor.prototype.unSelectItems = function () {
    this.mapFilter.editors.forEach(function (editor) {
      editor.$scope.room = null;
      editor.$scope.item = null;
      editor.mapOnItems('unSelect');
    });
  };

  SvgEditor.prototype.createPolylineMode = function (e) {
    var scale = this.camera.scale,
      tX, tY, mouse;
    tX = -this.camera.x / scale;
    tY = -this.camera.y / scale;
    if (this.createPolylinePolyline === null) {
      this.createPolylinePolyline = new geoP.Polyline(this);
      mouse = this.getMousePos(e);
      this.createPolylinePolyline.create(mouse.x / scale + tX, mouse.y / scale + tY);
    } else {
      this.createPolylinePolyline.appendPoint(this.newPoint.x, this.newPoint.y);
    }
  };

  function getAngle(cx, cy, ex, ey) {
    var dx, dy, theta;
    dx = ex - cx;
    dy = ey - cy;
    theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI; // rads to degs
    return theta;
  }

  function v2(angle, power) {
    var x, y;
    x = Math.sin(angle);
    y = Math.cos(angle);
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
    var pow, sqrt;
    pow = power(newPoint.x - lastPoint.x) + power(newPoint.y - lastPoint.y);
    sqrt = Math.sqrt(pow);
    return sqrt;
  }

  function updateNewPointFromAngle(a, newPoint, lastPoint) {
    var v = v2(a, hyp(newPoint, lastPoint));
    newPoint.x = lastPoint.x + v.x;
    newPoint.y = lastPoint.y + v.y;
  }

  function updateNewPositionIfShift($scope, newPoint, lastPoint) {
    var a;
    if ($scope.isShift === true) {
      a = getAngle(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
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

  SvgEditor.prototype.drawToMousePosition = function (e) {
    var scale, tX, tY, mousePos, lastPoint;
    scale = this.camera.scale;
    tX = -this.camera.x / scale;
    tY = -this.camera.y / scale;
    mousePos = this.getMousePos(e);

    this.newPoint = {
      x: mousePos.x / scale + tX,
      y: mousePos.y / scale + tY
    };

    if (this.createPolylinePolyline !== null) {
      lastPoint = this.createPolylinePolyline.getLastPoint();
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

  SvgEditor.prototype.finishCreateMode = function () {
    if (this.createEvents !== undefined) {
      this.paper.unclick(this.createEvents.createMode);
      this.paper.unmousemove(this.createEvents.move);
    }
    if (this.createPolylineLine !== null) {
      this.createPolylineLine.remove();
    }
    this.createPolylinePolyline = null;
    this.createPolylineLine = null;
    this.cleanCurrentOptions();
    this.setOptions();
  };

  SvgEditor.prototype.cancelCreateMode = function () {
    if (this.createPolylinePolyline !== null) {
      this.createPolylinePolyline.remove();
    }
    this.finishCreateMode();
  };

  SvgEditor.prototype.createPolyline = function () {
    var that = this;

    this.createEvents = {
      createMode: function (e) {
        that.createPolylineMode(e);
      },
      move: function (e) {
        that.drawToMousePosition(e);
      }
    };

    this.paper.click(this.createEvents.createMode);
    this.paper.mousemove(this.createEvents.move);

    return [{
      label:  geoP.i18n.ui.map_options.close_room,
      classes: 'btn-success',
      action: function () {
        if (that.createPolylinePolyline !== null) {
          that.createPolylinePolyline.close();
          that.createPolylinePolyline.save();
          that.items.push(that.createPolylinePolyline);
        }
        that.finishCreateMode();
      }
    }, {
      label: geoP.i18n.ui.map_options.cancel_room_creation,
      classes: 'btn-warning',
      action: that.cancelCreateMode.bind(that)
    }];
  };


  geoP.SvgEditor = SvgEditor;

}(GeoP, jQuery));