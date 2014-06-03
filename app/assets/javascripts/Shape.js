/*global GeoP:true */

(function(geoP) {
  "use strict";

  var Shape = function(svgEditor) {
    this.svgEditor = svgEditor;
  };


  Shape.prototype.stroke = function(c) {
    this.element.attr({
      'stroke': c
    });
  };

  Shape.prototype.fill = function(c) {
    this.element.attr({
      'fill': c
    });
  };

  // Shape.prototype.strokeAndFill = function(color) {
  //   this.element.attr({
  //     fill: color,
  //     stroke: color
  //   });
  // };


  geoP.Shape = Shape;

}(GeoP));