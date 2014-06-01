/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Polyline = function(svgEditor) {
    this.svgEditor = svgEditor;
  };

  Polyline.prototype.createSvgPoint = function(x, y) {
    var point = this.svgEditor.paper.node.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  };

  Polyline.prototype.create = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element = this.svgEditor.canvas.polyline(point.x, point.y);
    this.element.attr({
      fill: 'transparent',
      stroke: GeoP.Colors.Drawing
    });
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
  };

  Polyline.prototype.appendPoint = function(x, y) {
    var point = this.createSvgPoint(x, y);
    this.element.node.points.appendItem(point);
  };

  Polyline.prototype.registerHover = function() {
    this.element.hover(function(e) {
      that.svgEditor.stroke(that.element, GeoP.Colors.Selected);
    }, function() {
      that.svgEditor.stroke(that.element, GeoP.Colors.NotSelected);
    });
  };

  Polyline.prototype.close = function($scope) {
    var that = this;

    var p = this.element.node.points[0];
    this.appendPoint(p.x, p.y);

    this.svgEditor.stroke(this.element, GeoP.Colors.NotSelected);
    this.element.drag();
    // this.registerHover();
    this.element.click(function(e) {
      if ($scope.mode !== 'create') {
        that.svgEditor.unSelectItems();
        that.svgEditor.stroke(that.element, GeoP.Colors.Selected);
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