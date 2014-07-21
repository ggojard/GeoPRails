/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    this.moveCircles = [];
    this.pointIndex = 0;
    // this.isSelected = false;
    this.json = null;
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };


  function polygonArea(points) {
    var l = points.length
    var det = 0

    points = points.map(normalize);
    points = points.concat(points[0]);

    for (var i = 0; i < l; i++) {
      det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x
    }
    return Math.abs(det) / 2
  }

  function normalize(point) {
    if (Array.isArray(point)) {
      return {
        x: point[0],
        y: point[1]
      }
    } else {
      return point;
    }
  }

  Polyline.prototype.updateArea = function() {
    if (this.areaText !== void 0) {
      this.areaText.node.innerHTML = this.getArea() + ' m²';
    }
  };


  Polyline.prototype.getArea = function() {
    var points = [];

    var scaleLen = this.svgEditor.mapScale.length;
    var scaleDim = this.svgEditor.mapScale.getLength();


    if (this.element === void 0 || this.element.node === void 0) {
      return 0;
    }

    for (var i = 0; i < this.element.node.points.length; i++) {
      var p = this.element.node.points[i];
      var a = {
        x: p.x,
        y: p.y
      };
      a.x = a.x * scaleLen / scaleDim;
      a.y = a.y * scaleLen / scaleDim;
      points.push(a);
    }

    var l = polygonArea(points);
    l = parseFloat(l, 10).toFixed(1);
    // reparse to handle toFixed to float
    l = parseFloat(l, 10);
    return l;
  };

  Polyline.prototype.create = function(x, y) {
    var that = this;
    var point = this.createSvgPoint(x, y);
    this.element = this.svgEditor.canvas.polygon(point.x, point.y);
    this.element.attr({
      fill: 'transparent',
      stroke: GeoP.Colors.Drawing
    });
    this.group = this.svgEditor.canvas.group(this.element);
    this.addAndGetMovePoint(x, y, this.pointIndex);
    this.element.click(function() {
      var x = [];
      var y = [];
      for (var i = 0; i < that.moveCircles.length; i++) {
        var p = that.moveCircles[i];
        x.push(p.node.cx.baseVal.value);
        y.push(p.node.cy.baseVal.value);
      }
    });
  };

  Polyline.prototype.updateTextPosition = function(textSvg, yTranslate) {
    var bbox = this.element.node.getBBox();
    var textBbox = textSvg.node.getBBox();
    textSvg.attr({
      x: bbox.x + bbox.width / 2 - textBbox.width / 2,
      y: bbox.y + bbox.height / 2 + yTranslate * textBbox.height,
    });
  };

  Polyline.prototype.addText = function(text, yTranslate) {
    var t = this.svgEditor.canvas.text(0, 0, text);
    t.attr({
      fill: 'black'
    });
    t.node.style.cssText = 'font-size:12px;font-family:arial';
    this.updateTextPosition(t, yTranslate);
    this.group.add(t);
    return t;
  };

  Polyline.prototype.addAndGetMovePoint = function(x, y, pointIndex) {
    var that = this;
    var movePointCircle = this.svgEditor.canvas.circle(x, y, 5);
    movePointCircle.attr({
      stroke: 'red',
      fill: 'transparent',
      visibility: 'hidden'
    });
    this.group.add(movePointCircle);
    this.moveCircles.push(movePointCircle);

    movePointCircle.drag(function(cx, cy, x, y, e) {
      var scale = that.svgEditor.camera.scale;
      var tX = -that.svgEditor.camera.x;
      var tY = -that.svgEditor.camera.y;
      var mousePos = that.svgEditor.getMousePos(e);
      var mx = (mousePos.x / scale) - movePointCircle.node.cx.baseVal.value;
      var my = (mousePos.y / scale) - movePointCircle.node.cy.baseVal.value;

      var ctm = that.group.node.getCTM();
      mx -= ctm.e / scale;
      my -= ctm.f / scale;

      movePointCircle.node.cx.baseVal.value += mx;
      movePointCircle.node.cy.baseVal.value += my;
      var p = that.element.node.points[pointIndex];
      p.x += mx;
      p.y += my;

      that.updateArea();
      that.updateTextPosition(that.text, 0);
      that.updateTextPosition(that.areaText, 1);
    });

    movePointCircle.hover(function() {
      that.group.undrag();
    }, function() {
      that.group.drag();
    });
    this.pointIndex += 1;

    return movePointCircle;
  };

  Polyline.prototype.getLastPoint = function() {
    var l = this.element.node.points.length;
    if (l > 0) {
      return this.element.node.points[l - 1];
    }
    return null;
  };

  Polyline.prototype.remove = function() {
    this.element.remove();
    for (var i = 0; i < this.moveCircles.length; i++) {
      var c = this.moveCircles[i];
      c.remove();
    };
    if (this.text !== void 0) {
      this.text.remove();
    }
    if (this.areaText !== void 0) {
      this.areaText.remove();
    }
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };


  Polyline.prototype.setTexts = function() {
    this.text = this.addText(this.json.name, 0);
    this.areaText = this.addText(this.json.area + ' m²', 1);
  };

  Polyline.prototype.fillFromFilterColor = function(filterName) {
    var color = 'transparent';
    if (this.json[filterName] !== null) {
      var item = this.svgEditor.filters[filterName][this.json[filterName].id];
      if (item.state === true) {
        this.element.attr({
          fill: item.color
        });
      } else {
        this.element.attr({
          fill: 'transparent'
        });
        this.doActionIfItemIsSelected();
      }
    }
  };

  Polyline.prototype.doActionIfItemIsSelected = function() {
    if (G_Room && G_Room.id === this.json.id) {
      this.element.attr({
        fill: '#1dc8fe'
      });
      this.svgEditor.$scope.room = this;
      this.addZoomOnItemOption();
    }

  };


  Polyline.prototype.loadFromJson = function(json) {
    this.json = json;

    if (this.json.points === null) {
      return;
    }

    if (this.json.points !== null) {
      var points = JSON.parse(this.json.points);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (i === 0) {
          this.create(p.x, p.y);
        } else {
          this.appendPoint(p.x, p.y);
        }
      }
    }
    if (points.length === 0) {
      return;
    }
    this.close(this.svgEditor.$scope);

    this.setTexts();
    this.doActionIfItemIsSelected();
  };

  Polyline.prototype.registerHover = function() {
    this.element.hover(function(e) {
      that.stroke(GeoP.Colors.Selected);
    }, function() {
      that.stroke(GeoP.Colors.NotSelected);
    });
  };

  Polyline.prototype.setMovePointsToVisibility = function(visibility) {
    var that = this;
    for (var i = 0; i < that.moveCircles.length; i++) {
      var movePointCircle = that.moveCircles[i];
      movePointCircle.attr({
        visibility: visibility
      });
    }
  };


  Polyline.prototype.updateHashCode = function() {
    this.hashCode = this.getHash();
  };

  Polyline.prototype.getHash = function() {
    if (this.group !== void 0) {
      var bbox = JSON.stringify(this.group.node.getBBox());
      var h = [bbox];
      h.push(JSON.stringify(this.group._.transform));
      return geoP.hashCode(h.join(''));
    }
    return 0;
  };

  Polyline.prototype.getPointsData = function() {
    var points = [];
    if (this.group === void 0) {
      return points;
    }

    var camera = this.svgEditor.camera;
    var ctm = this.group.node.getCTM();
    var scale = camera.scale;
    var x = ctm.e / scale;
    var y = ctm.f / scale;
    for (var i = 0; i < this.element.node.points.length; i++) {
      var p = this.element.node.points[i];
      points.push({
        x: p.x + x - camera.x,
        y: p.y + y - camera.y
      });
    }
    return JSON.stringify(points);
  };

  Polyline.prototype.save = function(callback) {
    var that = this;
    if (this.json === null) {
      var data = {
        'points': this.getPointsData(),
        'area': this.getArea(),
        'floor_id': this.svgEditor.json.id,
        'name': 'B?'
      };
      this.svgEditor.$http.post('/rooms.json', data).success(function(d) {
        geoP.notifications.done('La nouvelle pièce a été crée.');
        that.json = d;
        that.setTexts();
        that.updateHashCode();
        return callback && callback();
      }).error(function(data, status, headers, config) {
        console.error('impossible to create new');
      });
      return null;
    }
    var data = {
      'id': this.json.id,
      'room': {
        'points': this.getPointsData(),
        'area': this.getArea()
      }
    };
    this.svgEditor.$http.put('/rooms/' + this.json.id + '.json', data).success(function(d) {
      geoP.notifications.done('La pièce ' + that.json.name + ' a été sauvegardée.');
      that.updateHashCode();
      return callback && callback();
    }).error(function(data, status, headers, config) {
      console.error('impossible to update');
    });
  };

  Polyline.prototype.unSelect = function() {
    this.stroke(GeoP.Colors.NotSelected);
    this.setMovePointsToVisibility('hidden');

    // if (this.isSelected === true) {
    var currentHash = this.getHash();
    if (this.hashCode !== currentHash) {
      this.save();
    }
    // }

    // this.isSelected = false;
  };

  Polyline.prototype.zoomOnItem = function() {
    var box = this.group.getBBox();
    this.svgEditor.centerOnBox(box);

  };

  Polyline.prototype.addZoomOnItemOption = function() {
    var that = this;
    var $scope = this.svgEditor.$scope;
    $scope.currentOptions.push({
      label: 'Zoomer sur ' + that.json.name,
      classes: 'btn-info',
      icon : 'fa-search',
      action: function() {
        that.zoomOnItem();
      }
    });
  };

  Polyline.prototype.select = function(e) {
    var that = this;
    var $scope = this.svgEditor.$scope;
    // that.isSelected = true;
    // 
    switch ($scope.mode) {
      case 'normal':
      case 'edit':
        $scope.room = that;

        that.svgEditor.unSelectItems();
        that.setMovePointsToVisibility('visible');
        that.stroke(GeoP.Colors.Selected);
        geoP.currentEvent = e;
        $scope.mode = 'edit';
        $scope.currentOptions = [{
          label: 'Supprimer ' + that.json.name,
          classes: 'btn-danger',
          icon:'fa-trash-o',
          action: function() {
            that.remove();
            $scope.cleanCurrentOptions();
          }
        }];
        that.addZoomOnItemOption()
        $scope.$apply();
        break;
    }
  };

  Polyline.prototype.close = function($scope) {
    var that = this;

    this.stroke(GeoP.Colors.NotSelected);
    this.updateHashCode();

    switch (G_Mode) {
      case 'edit':
        this.group.drag();
        this.element.click(this.select.bind(this));
        break;
      case 'show':
        this.element.click(function(e) {
          document.location.href = '/floors/' + G_FloorJson.id + '/room/' + that.json.id;
        });
        break;
    }


  };

  geoP.Polyline = Polyline;


}(GeoP));