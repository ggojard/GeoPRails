/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    this.moveCircles = [];
    this.pointIndex = 0;
    this.isSelected = false;
    this.json = {};
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };

  function polygonArea(X, Y, numPoints) {
    var area = 0; // Accumulates area in the loop
    var j = numPoints - 1; // The last vertex is the 'previous' one to the first

    for (var i = 0; i < numPoints; i++) {
      area = area + (X[j] + X[i]) * (Y[j] - Y[i]);
      j = i; //j is previous vertex to i
    }
    return area / 2;
  }

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

  Polyline.prototype.updateTextPosition = function() {
    var bbox = this.element.node.getBBox();
    var textBbox = this.text.node.getBBox();
    this.text.attr({
      x: bbox.x + bbox.width / 2 - textBbox.width / 2,
      y: bbox.y + bbox.height / 2 + textBbox.height / 2,
    });
  };

  Polyline.prototype.addText = function(text) {
    this.text = this.svgEditor.canvas.text(0, 0, text);
    this.updateTextPosition();
    this.group.add(this.text);
  };

  Polyline.prototype.addAndGetMovePoint = function(x, y, pointIndex) {
    var that = this;
    var movePointCircle = this.svgEditor.canvas.circle(x, y, 5);
    movePointCircle.attr({
      stroke: 'transparent',
      fill: 'transparent'
    });
    this.group.add(movePointCircle);
    this.moveCircles.push(movePointCircle);

    movePointCircle.drag(function(cx, cy, x, y, e) {

      var scale = that.svgEditor.$scope.camera.scale;
      var tX = -that.svgEditor.$scope.camera.x;
      var tY = -that.svgEditor.$scope.camera.y;

      var mx = (e.offsetX / scale) - movePointCircle.node.cx.baseVal.value;
      var my = (e.offsetY / scale) - movePointCircle.node.cy.baseVal.value;

      var ctm = that.group.node.getCTM();
      mx -= ctm.e / scale;
      my -= ctm.f / scale;

      movePointCircle.node.cx.baseVal.value += mx;
      movePointCircle.node.cy.baseVal.value += my;
      var p = that.element.node.points[pointIndex];
      p.x += mx;
      p.y += my;
      that.updateTextPosition();
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
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
  };

  Polyline.prototype.loadFromJson = function(json) {
    this.json = json;
    var points = JSON.parse(json.points);
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (i === 0) {
        this.create(p.x, p.y);
      } else {
        this.appendPoint(p.x, p.y);
      }
    }
    this.close(this.svgEditor.$scope);
    this.addText(json.name);
  };

  Polyline.prototype.registerHover = function() {
    this.element.hover(function(e) {
      that.stroke(GeoP.Colors.Selected);
    }, function() {
      that.stroke(GeoP.Colors.NotSelected);
    });
  };

  Polyline.prototype.setColorsToMovePoints = function(color) {
    var that = this;
    for (var i = 0; i < that.moveCircles.length; i++) {
      var movePointCircle = that.moveCircles[i];
      movePointCircle.attr({
        stroke: color,
        fill: 'transparent'
      });
    }
  };

  Polyline.prototype.unSelect = function() {
    this.stroke(GeoP.Colors.NotSelected);
    this.setColorsToMovePoints('transparent');

    if (this.isSelected === true) {

    }

    this.isSelected = false;
  };

  Polyline.prototype.close = function($scope) {
    var that = this;

    var p = this.element.node.points[0];
    this.stroke(GeoP.Colors.NotSelected);
    this.group.drag();
    this.element.click(function(e) {
      that.isSelected = true;
      if ($scope.mode !== 'create') {
        that.svgEditor.unSelectItems();
        that.setColorsToMovePoints('red');
        that.stroke(GeoP.Colors.Selected);
        geoP.currentEvent = e;
        $scope.mode = 'edit';
        $scope.currentOptions = [{
          label: 'remove',
          action: function() {
            that.remove();
            $scope.cleanCurrentOptions();
          }
        }];
        $scope.$apply();
      }
    });
  };

  geoP.Polyline = Polyline;


}(GeoP));