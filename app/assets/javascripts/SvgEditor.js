/*global GeoP:true, Snap:true, jQuery:true */



(function(geoP, $) {
  'use strict';

  var snap = Snap,
    SvgEditor;

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
    /*jshint validthis:true */
    if (geoP.currentEvent === null && this.$scope.mapMode !== 'create') {
      this.unSelectItems();
      this.cleanCurrentOptions();
      this.cleanDragPointOptions();
      this.$scope.$apply();
    }
    geoP.currentEvent = null;
  }

  SvgEditor = function(floorJson, $scope, $http, $rootScope, mapFilter) {

    var dim, bgBox, border, imagePath, that = this;

    this.svgId = 'map-' + floorJson.id;
    this.paper = snap('#' + this.svgId);
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
    this.itemsById = {};
    $rootScope.itemsById = this.itemsById;
    this.canvas = this.paper.g();
    this.canvas.node.id = 'viewport-' + floorJson.id;
    this.lastMovePosition = null;
    this.currentOptions = [];
    this.dragPointsOptions = [];

    that.displayProperties = $rootScope.displayNames;

    window.onhashchange = function() {
      $scope.roomId = geoP.getRoomIdFromHash();
      that.itemsById[$scope.roomId].doActionIfItemIsSelected();
      setTimeout(function() {
        $scope.$apply();
      }, 0);
    };

    $((function() {
      $('#' + that.svgId).svgPan(that.canvas.node.id, that);
    }()));

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

    border = this.canvas.rect(bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    border.attr({
      fill: 'white',
      stroke: '#ffcf00'
    });

    imagePath = 'http://' + window.location.host + '/floors/images/' + this.json.id + '?style=original';
    this.bg = this.canvas.image(imagePath, bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    this.bg.node.style.cssText = 'opacity: 0.25';


    this.applyTransform();


    this.paper.mousemove(mouseMove.bind(this));
    this.paper.click(mouseClick.bind(this));

    this.mapScale = new geoP.MapScale(this);
    this.mapScale.loadFromFloor(this.json);
    this.$scope.mapScale = this.mapScale;

    switch ($scope.mapMode) {
      case 'show':
        this.mapScale.hide();
        break;
    }

    if (this.camera.scale === geoP.DefaultCamera.scale) {
      this.centerMap();
    }



    $rootScope.$on('DisplayNames.Update', function(e, displayNames) {
      /*jslint unparam:true*/
      that.displayProperties = displayNames;
      that.mapOnItems('removeDisplayTexts');
      that.mapOnItems('setTexts');
    });

  };

  SvgEditor.prototype.updateCamera = function() {
    var ctm = this.canvas.node.getCTM();
    this.camera.x = ctm.e;
    this.camera.y = ctm.f;
    this.camera.scale = ctm.d;
  };

  SvgEditor.prototype.cleanDragPointOptions = function() {
    this.dragPointsOptions = [];
  };

  SvgEditor.prototype.removePolyline = function() {
    // need to take it out of the items //TODO
    return undefined;
  };

  SvgEditor.prototype.cleanCurrentOptions = function() {
    this.currentOptions = [];
    if (this.$scope.mapMode === 'create') {
      this.$scope.mapMode = 'edit';
    }
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


  SvgEditor.prototype.drag = function(e, node, moveMethod) {
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


  SvgEditor.prototype.centerOnBox = function(boxSize) {
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

    this.applyTransform();
  };

  SvgEditor.prototype.centerMap = function() {
    this.centerOnBox(this.bgBox);
  };

  SvgEditor.prototype.createRoomFromJson = function(json) {
    var b = new geoP.Polyline(this);
    b.loadFromJson(json);
    this.items.push(b);
    this.itemsById[b.json.id] = b;
  };

  SvgEditor.prototype.updateBelongsToAvailable = function(belongsToNameList, belongsToKeyName) {
    var floorJson = this.json,
      itemsObject, targetItem, i, item;
    if (this.mapFilter.filters[belongsToKeyName] === undefined) {
      this.mapFilter.filters[belongsToKeyName] = {};
    }
    itemsObject = this.mapFilter.filters[belongsToKeyName];
    for (i = 0; i < floorJson[belongsToNameList].length; i += 1) {
      item = floorJson[belongsToNameList][i];
      if (item[belongsToKeyName] !== null) {
        targetItem = item[belongsToKeyName];
        if (targetItem !== undefined) {
          if (itemsObject[targetItem.id] === undefined) {
            itemsObject[targetItem.id] = targetItem;
            itemsObject[targetItem.id].state = false;
            itemsObject[targetItem.id].count = 0;
            itemsObject[targetItem.id].areaSum = 0;
            itemsObject[targetItem.id].nbPeople = 0;
            itemsObject[targetItem.id].perimeterSum = 0;
          }
          itemsObject[targetItem.id].count += 1;
          itemsObject[targetItem.id].areaSum += item.area;
          itemsObject[targetItem.id].areaSum = parseFloat(itemsObject[targetItem.id].areaSum.toFixed(1), 10);

          itemsObject[targetItem.id].perimeterSum += item.perimeter;
          itemsObject[targetItem.id].perimeterSum = parseFloat(itemsObject[targetItem.id].perimeterSum.toFixed(1), 10);
          itemsObject[targetItem.id].nbPeople += item.affectations.length;
          if (itemsObject[targetItem.id].nbPeople === 0) {
            itemsObject[targetItem.id].ratio = 0;
          } else {
            itemsObject[targetItem.id].ratio = parseFloat(itemsObject[targetItem.id].areaSum / itemsObject[targetItem.id].nbPeople, 10).toFixed(1);
          }

        }

      }
    }
  };

  SvgEditor.prototype.loadBelongsToFilter = function(belongsToNameList, belongsToKeyName) {
    this.updateBelongsToAvailable(belongsToNameList, belongsToKeyName);
    this.$rootScope.$emit(belongsToKeyName + '_filters.Update', this.mapFilter.filters[belongsToKeyName]);
  };


  SvgEditor.prototype.setOptions = function() {
    var $scope = this.$scope,
      that = this,
      createPolyline, mapZoomDefault, editMode, editModeAdmin, stopEditMode, saveToImage;

    createPolyline = {
      label: 'Créer pièce',
      icon: 'fa-pencil',
      action: function() {
        $scope.mapMode = 'create';
        var opts = that.createPolyline();
        that.currentOptions = opts;
      },
      classes: 'btn-success'
    };

    mapZoomDefault = {
      label: 'Centrer le plan',
      icon: 'fa-crosshairs',
      action: function() {
        that.centerMap();
      },
      classes: 'btn-default'
    };


    editMode = {
      label: 'Modifier le plan',
      icon: 'fa-unlock',
      action: function() {
        document.location.href = '/floors/' + that.json.id + '/edit';
      },
      classes: 'btn-default'
    };

    editModeAdmin = {
      label: 'Modifier l\'étage',
      icon: 'fa-edit',
      action: function() {
        document.location.href = '/admin/floors/' + that.json.id + '/edit';
      },
      classes: 'btn-default'
    };


    stopEditMode = {
      label: 'Arrêter la modification',
      icon: 'fa-lock',
      action: function() {
        document.location.href = '/floors/' + that.json.id;
      },
      classes: 'btn-default'
    };

    saveToImage = {
      label: 'Sauvegarder l\'étage en image',
      icon: 'fa-picture-o',
      action: function() {
        that.exportToImage();
      },
      classes: 'btn-default'
    };


    switch (this.$scope.mapMode) {
      case 'edit':
        this.buttonOptions = [stopEditMode, createPolyline, mapZoomDefault];
        break;
      case 'show':
        this.buttonOptions = [editMode, saveToImage, editModeAdmin, mapZoomDefault];
        break;
    }
  };

  SvgEditor.prototype.mapOnItems = function(methodName, a1, a2) {
    var i = 0;
    for (i = 0; i < this.items.length; i += 1) {
      if (this.items[i].element !== undefined) {
        this.items[i][methodName](a1, a2);
      }
    }
  };

  SvgEditor.prototype.loadRooms = function() {
    var that = this,
      i, r;
    for (i = 0; i < this.json.rooms.length; i += 1) {
      r = this.json.rooms[i];
      that.createRoomFromJson(r);
    }
  };

  SvgEditor.prototype.unSelectItems = function() {
    this.mapOnItems('unSelect');
  };

  SvgEditor.prototype.createPolylineMode = function(e) {
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

  SvgEditor.prototype.drawToMousePosition = function(e) {
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


  SvgEditor.prototype.createPolyline = function() {
    var that = this,
      createMode, move;

    createMode = this.createPolylineMode.bind(this);
    move = this.drawToMousePosition.bind(this);
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
          that.createPolylinePolyline.close();
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

}(GeoP, jQuery));
