/*global GeoP*/

(function(geoP) {
  'use strict';

  var circleColor = {
      stroke: 'red',
      fill: 'transparent'
    },
    mapScale;

  mapScale = function(editor) {
    this.editor = editor;
    this.length = 1;
  };

  mapScale.prototype.create = function(x1, y1, x2, y2) {
    this.line = this.editor.canvas.line(x1, y1, x2, y2);
    this.line.attr({
      stroke: 'red'
    });

    this.createPoint(x1, y1, 1);
    this.createPoint(x2, y2, 2);

  };

  mapScale.prototype.applyAttributes = function(attributes) {
    this.c1.attr(attributes);
    this.c2.attr(attributes);
    this.line.attr(attributes);
  };

  mapScale.prototype.show = function() {
    this.applyAttributes({
      visibility: 'visible'
    });
  };


  mapScale.prototype.hide = function() {
    this.applyAttributes({
      visibility: 'hidden'
    });
  };


  mapScale.prototype.updateMapScale = function() {
    var that = this,
      data = {
        'map_scale_length': this.length
      };
    that.editor.$http.put('/floors/' + that.editor.json.id + '.json', data).success(function() {
      that.editor.items.map(function(i) {
        i.updateArea();
      });

    });
  };

  mapScale.prototype.loadFromFloor = function(floorJson) {

    if (floorJson.map_scale_x1 === null) {
      floorJson.map_scale_x1 = 0;
    }
    if (floorJson.map_scale_y1 === null) {
      floorJson.map_scale_y1 = 0;
    }
    if (floorJson.map_scale_x2 === null) {
      floorJson.map_scale_x2 = 50;
    }
    if (floorJson.map_scale_y2 === null) {
      floorJson.map_scale_y2 = 50;
    }

    this.create(floorJson.map_scale_x1, floorJson.map_scale_y1, floorJson.map_scale_x2, floorJson.map_scale_y2);
    this.length = floorJson.map_scale_length;
  };

  mapScale.prototype.getLength = function() {
    var x1, y1, x2, y2;
    x1 = this.line.node.x1.baseVal.value;
    y1 = this.line.node.y1.baseVal.value;
    x2 = this.line.node.x2.baseVal.value;
    y2 = this.line.node.y2.baseVal.value;

    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
  };

  mapScale.prototype.createPoint = function(x, y, index) {
    var that = this;
    function empty() {
      return undefined;
    }
    this['c' + index] = this.editor.canvas.circle(x, y, 5);
    this['c' + index].attr(circleColor);
    this['c' + index].drag(function(cx, cy, x, y, e) {
      /*jslint unparam:true*/
      that.editor.drag(e, that['c' + index].node, function(mx, my) {
        that.line.node['x' + index].baseVal.value += mx;
        that.line.node['y' + index].baseVal.value += my;
      });
    }, empty, function() {
      var data;
      data = {};
      data['map_scale_x' + index] = that.line.node['x' + index].baseVal.value;
      data['map_scale_y' + index] = that.line.node['y' + index].baseVal.value;
      that.editor.$http.put('/floors/' + that.editor.json.id + '.json', data).success(empty);
    });
  };


  geoP.MapScale = mapScale;


}(GeoP));
