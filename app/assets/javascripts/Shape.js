/*global GeoP */

(function(geoP) {
  'use strict';

  var Shape = function(svgEditor) {
    this.svgEditor = svgEditor;
  };

  Shape.prototype.stroke = function(c) {
    if (this.element !== undefined) {
      this.element.attr({
        'stroke': c
      });
    }
  };

  Shape.prototype.fill = function(c) {
    this.element.attr({
      'fill': c
    });
  };

  geoP.Shape = Shape;

}(GeoP));
