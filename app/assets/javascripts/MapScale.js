(function(geoP) {

  var circleColor = {
    stroke: 'red',
    fill: 'transparent'
  };


  var mapScale = function(editor) {
    this.editor = editor;
    this.length = 1;
  }

  mapScale.prototype.create = function(x1, y1, x2, y2) {
    var that = this;

    this.line = this.editor.canvas.line(x1, y1, x2, y2);
    this.line.attr({
      stroke: 'red'
    });

    this.createPoint(x1, y1, 1);
    this.createPoint(x2, y2, 2);

  };

  mapScale.prototype.hide = function() {
    var hidden = {
      visibility: 'hidden'
    };
    this.c1.attr(hidden);
    this.c2.attr(hidden);
    this.line.attr(hidden);
  };


  mapScale.prototype.updateMapScale = function() {
    var that = this;
    var data = {
      'map_scale_length': this.length
    };
    that.editor.$http.put('/floors/' + that.editor.json.id + '.json', data).success(function(d) {
      that.editor.items.map(function(i) {
        i.updateArea();
      });

    });
  };

  mapScale.prototype.loadFromFloor = function(floorJson) {
    // console.log(floorJson);

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
    this['c' + index] = this.editor.canvas.circle(x, y, 5);
    this['c' + index].attr(circleColor);
    this['c' + index].drag(function(cx, cy, x, y, e) {
      that.editor.drag(e, that['c' + index].node, function(mx, my) {
        that.line.node['x' + index].baseVal.value += mx;
        that.line.node['y' + index].baseVal.value += my;
      });
    }, function() {}, function() {

      var length = that.getLength();
      var data = {};

      data['map_scale_x' + index] = that.line.node['x' + index].baseVal.value;
      data['map_scale_y' + index] = that.line.node['y' + index].baseVal.value;

      that.editor.$http.put('/floors/' + that.editor.json.id + '.json', data).success(function(d) {});
    });

  };


  geoP.MapScale = mapScale;


}(GeoP));