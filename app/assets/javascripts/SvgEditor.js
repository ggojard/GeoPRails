/*global GeoP:true */

(function(geoP) {
  "use strict";


  var a = Snap;

  function getMousePos(e) {
    var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
    var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
    return {
      x: x,
      y: y
    };
  }

  function mouseWheel(e) {
    /*jshint validthis:true */

    if (this.$scope.isCtrlKeyDown === true) {
      e.preventDefault();
      var factor = 1;
      if (e.wheelDelta < 0) {
        factor = -1;
      }
      this.camera.scale += (factor * 0.01);
      if (this.camera.scale < 0.05) {
        this.camera.scale = 0.05;
      }
      this.applyTransform();
    }
  }

  function mouseMove(ev) {
    /*jshint validthis:true */

    if (this.$scope.isCtrlKeyDown === true && this.lastMovePosition !== null) {
      var diff = {
        x: this.lastMovePosition.x - ev.x,
        y: this.lastMovePosition.y - ev.y
      };
      this.camera.x -= diff.x / this.camera.scale;
      this.camera.y -= diff.y / this.camera.scale;
      this.applyTransform();
    }

    this.lastMovePosition = {
      x: ev.x,
      y: ev.y
    };
  }

  function mouseClick(e) {
    /*jshint validthis:true */

    if (geoP.currentEvent === null && this.$scope.mode !== 'create') {
      this.unSelectItems();
      this.$scope.cleanCurrentOptions();
      this.$scope.$apply();
    }
    geoP.currentEvent = null;
  }

  var SvgEditor = function(svgId, floorJson, $scope, $http, $rootScope) {
    var that = this;
    this.paper = a(svgId);
    if (this.paper === null) {
      return;
    }
    this.json = floorJson;
    this.$scope = $scope;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.filters = {};
    this.loadCamera();
    this.createPolylineLine = null;
    this.createPolylinePolyline = null;
    this.newPoint = null;
    this.items = [];
    this.canvas = this.paper.g();
    this.lastMovePosition = null;


    var dim = JSON.parse(this.json.image_dimensions);

    var bgBox = {
      x: 0,
      y: 0,
      w: dim.w,
      h: dim.h
    };

    this.bgBox = bgBox;
    // console.log(this.json.image);
    // var imagePath = 'http://' + window.location.host + this.json.image;
    var imagePath = 'http://localhost:3000/floors/images/1?style=original';
    this.bg = this.canvas.image(imagePath, bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    this.bg.node.style.cssText = 'opacity: 0.25';
    var border = this.canvas.rect(bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    border.attr({
      fill: 'transparent',
      stroke: '#ffcf00'
    });

    this.loadFilters();

    this.applyTransform();

    this.paper.node.addEventListener("mousewheel", mouseWheel.bind(this), false);
    this.paper.node.addEventListener("DOMMouseScroll", mouseWheel.bind(this), false);

    this.paper.mousemove(mouseMove.bind(this));
    this.paper.click(mouseClick.bind(this));

    this.mapScale = new geoP.MapScale(this);
    this.mapScale.loadFromFloor(this.json);
    this.$scope.mapScale = this.mapScale;

    switch (G_Mode) {
      case 'show':
        this.mapScale.hide();
        break;
    }
  };

  SvgEditor.prototype.getFloorFullName = function() {
    var n = this.json.building.name + '-' + this.json.name;
    n = n.replace(/ /g, '_');
    return n;
  };

  SvgEditor.prototype.drag = function(e, node, moveMethod) {
    var scale = this.camera.scale;
    var tX = -this.camera.x;
    var tY = -this.camera.y;
    if (e.offsetX < 0 || e.offsetY < 0) {
      return;
    }
    var mx = (e.offsetX / scale) - node.cx.baseVal.value;
    var my = (e.offsetY / scale) - node.cy.baseVal.value;

    var ctm = this.canvas.node.getCTM();
    mx -= ctm.e / scale;
    my -= ctm.f / scale;

    node.cx.baseVal.value += mx;
    node.cy.baseVal.value += my;

    return moveMethod(mx, my);
  };


  SvgEditor.prototype.centerMap = function() {
    var $svg = $(this.paper.node);
    var paperSize = {
      w: $svg.width(),
      h: $svg.height()
    };

    // this.camera.scale = 1;this.camera.x = 0;this.camera.y = 0;this.applyTransform();

    var mapSize = this.bgBox;

    var ratioW = paperSize.w / mapSize.w;
    var ratioH = paperSize.h / mapSize.h;

    // use the minimun scale ratio
    var ratio = ratioH;
    if (ratioW < ratioH){
      ratio = ratioW;
    }

    this.camera.scale = ratio;


    var scaledWidth = mapSize.w * ratio;
    var scaledHeight = mapSize.h * ratio;

    this.camera.x = (paperSize.w - scaledWidth) / 2;
    this.camera.y = (paperSize.h - scaledHeight) / 2;;
    this.applyTransform();
  };

  SvgEditor.prototype.createRoomFromJson = function(json) {
    var b = new geoP.Polyline(this);
    b.loadFromJson(json);
    this.items.push(b);
  };

  function getBelongsToAvailable(floorJson, belongsToNameList, belongsToKeyName) {
    var itemsObject = {};
    for (var i = 0; i < floorJson[belongsToNameList].length; i++) {
      var item = floorJson[belongsToNameList][i];
      if (item[belongsToKeyName] !== null) {
        var targetItem = item[belongsToKeyName];
        if (itemsObject[targetItem.id] === void 0) {
          itemsObject[targetItem.id] = targetItem;
          itemsObject[targetItem.id].state = false;
          itemsObject[targetItem.id].count = 0;
          itemsObject[targetItem.id].areaSum = 0;
        } else {}
        itemsObject[targetItem.id].count += 1;
        itemsObject[targetItem.id].areaSum += item.area;
      }
    }
    return itemsObject;
  }

  SvgEditor.prototype.loadBelongsToFilter = function(belongsToNameList, belongsToKeyName, callback) {
    var that = this;
    this.filters[belongsToKeyName] = getBelongsToAvailable(this.json, belongsToNameList, belongsToKeyName);
    this.$rootScope.$emit(belongsToKeyName + '_filters.Update', this.filters[belongsToKeyName]);

    this.$rootScope.$on(belongsToKeyName + '_filters.StateChange', function(e, item) {
      that.filters[belongsToKeyName][item.id] = item;
      return callback(e, item);
    });
  };

  SvgEditor.prototype.loadFilters = function() {
    var that = this;
    var filtersNames = GeoP.filtersNames;
    for (var i = 0; i < filtersNames.length; i++) {
      (function(filterName) {
        that.loadBelongsToFilter('rooms', filterName, function(e, item) {
          that.mapOnItems('fillFromFilterColor', filterName);
        });
      }(filtersNames[i].name));
    }
  };

  SvgEditor.prototype.mapOnItems = function(methodName, a1, a2) {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i][methodName](a1, a2);
    };
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
    var tX = -this.camera.x;
    var tY = -this.camera.y;

    if (this.createPolylinePolyline === null) {
      this.createPolylinePolyline = new geoP.Polyline(this);

      var mouse = getMousePos(e);

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
    var tX = -this.camera.x;
    var tY = -this.camera.y;
    if (this.createPolylinePolyline !== null) {
      var lastPoint = this.createPolylinePolyline.getLastPoint();
      if (lastPoint !== null) {
        if (this.createPolylineLine === null) {
          var mouse = getMousePos(e);
          this.createPolylineLine = this.canvas.line(lastPoint.x, lastPoint.y, mouse.x / scale, mouse.y / scale);
          this.createPolylineLine.attr({
            stroke: 'orange',
            'stroke-dasharray': [5, 5]
          });
        } else {
          this.newPoint = {
            x: e.offsetX / scale + tX,
            y: e.offsetY / scale + tY
          };
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
      $scope.cleanCurrentOptions();
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