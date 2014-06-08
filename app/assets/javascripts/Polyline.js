/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Polyline = function(svgEditor) {
    geoP.extend(geoP.Shape, this, svgEditor);
    console.log(this);
    this.moveCircles = [];
    this.pointIndex = 0;
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };

  Polyline.prototype.create = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element = this.svgEditor.canvas.polygon(point.x, point.y);
    this.element.attr({
      fill: 'transparent',
      stroke: GeoP.Colors.Drawing
    });
    this.group = this.svgEditor.paper.group(this.element);
    this.addAndGetMovePoint(x, y, this.pointIndex);
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
    // movePointCircle.drag(function(e) {
    //   console.log('move', e);
    // });

    // console.log(movePointCircle);
    movePointCircle.drag(function(cx, cy) {
      // movePointCircle.node.cx
      movePointCircle.animate({
        cx: x + cx,
        cy: y + cy
      }, 5);

      var p = that.element.node.points[pointIndex];
      // console.log(p);
      p.x = x + cx;
      p.y = y + cy;

      // console.log(x, y);
    });

    movePointCircle.hover(function() {
      that.group.undrag();
      // movePointCircle.drag();
      // that.grou
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
      var c =this.moveCircles[i];
      c.remove();
    };
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
    this.addAndGetMovePoint(x, y, this.pointIndex);
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
        fill: color
      });
    }
  };

  Polyline.prototype.close = function($scope) {
    var that = this;

    var p = this.element.node.points[0];
    // this.appendPoint(p.x, p.y);

    this.stroke(GeoP.Colors.NotSelected);
    this.group.drag();
    // this.registerHover();
    this.element.click(function(e) {
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