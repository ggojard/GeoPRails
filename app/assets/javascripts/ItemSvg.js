/*global GeoP*/

(function(geoP) {
  'use strict';

  function ItemSvg(room, json) {
    this.room = room;
    this.svgEditor = this.room.svgEditor;
    this.json = json;
    this.options = [];

  }

  ItemSvg.prototype.create = function($http, itemType, callback) {
    var that = this;
    this.addToDatabase($http, itemType, function() {
      that.addToEditor();
      that.room.addItemSvg(that);
      return callback && callback(that);
    });
  };

  ItemSvg.prototype.getHash = function() {
    /*jslint nomen: true*/
    var h = [];
    h.push(this.json.x, this.json.y);
    return geoP.hashCode(h.join(''));
  };

  ItemSvg.prototype.updateHashCode = function() {
    this.hashCode = this.getHash();
  };

  ItemSvg.prototype.unSelect = function() {
    this.circleSvg.node.setAttribute('class', 'unselected');
    if (this.hashCode !== this.getHash()) {
      this.save();
    }
  };

  ItemSvg.prototype.save = function(callback) {
    var data = this.json,
      that = this;
    if (this.json !== null) {
      this.svgEditor.$http.put('/items/' + this.json.id + '.json', data).success(function() {
        geoP.notifications.done('L\'objet de type ' + that.json.item_type.name + ' a été sauvegardée.');
        that.updateHashCode();
        return callback && callback();
      }).error(function() {
        console.error('impossible to update the item');
      });
    }
  };

  ItemSvg.prototype.select = function(e) {
    geoP.currentEvent = e;
    this.room.unSelectItems();
    this.circleSvg.node.setAttribute('class', 'item-selected');
  };

  ItemSvg.prototype.addToEditor = function() {
    var that = this;
    this.circleSvg = this.svgEditor.canvas.circle(this.json.x, this.json.y, 5);
    this.circleSvg.attr({
      fill: this.json.item_type.color
    });
    this.circleSvg.click(this.select.bind(this));
    this.updateHashCode();


    this.circleSvg.drag(function(cx, cy, x, y, e) {
      /*jslint unparam: true*/

      var scale, mousePos, mx, my, ctm;
      scale = that.svgEditor.camera.scale;
      mousePos = that.svgEditor.getMousePos(e);
      mx = (mousePos.x / scale) - that.circleSvg.node.cx.baseVal.value;
      my = (mousePos.y / scale) - that.circleSvg.node.cy.baseVal.value;

      ctm = that.circleSvg.node.getCTM();
      mx -= ctm.e / scale;
      my -= ctm.f / scale;

      that.circleSvg.node.cx.baseVal.value += mx;
      that.circleSvg.node.cy.baseVal.value += my;

      that.json.x = that.circleSvg.node.cx.baseVal.value;
      that.json.y = that.circleSvg.node.cy.baseVal.value;
      // p = that.circleSvg.node.points.getItem(that.circleSvg.pointIndex);
      // p.x += mx;
      // p.y += my;

    });

    // this.circleSvg.drag();
  };

  ItemSvg.prototype.addToDatabase = function($http, itemType, callback) {
    var data, middle = this.room.getMiddle(),
      that = this;
    data = {
      'x': middle.x,
      'y': middle.y,
      'item_type_id': itemType.id,
      'room_id': this.room.json.id
    };
    $http.post('/items.json', data).success(function(res) {
      that.json = res;
      return callback && callback(res);
    });
  };

  geoP.ItemSvg = ItemSvg;

}(GeoP));
