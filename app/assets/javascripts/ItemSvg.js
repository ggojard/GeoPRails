/*global GeoP, gon*/

(function(geoP) {
  'use strict';

  function ItemSvg(room, json) {
    this.room = room;
    this.svgEditor = this.room.svgEditor;
    this.svgEditor.$scope.item_qualities = gon.item_qualities;
    this.json = json;
    this.options = [];
    this.editMode = false;
    this.setOptions();
  }


  ItemSvg.prototype.setOptions = function() {
    var that = this;

    this.buttons = {};

    this.buttons.zoom = {
      label: 'Zoomer',
      classes: 'btn-info',
      icon: 'fa-search',
      action: function() {
        that.zoomOnItem();
      }
    };

    this.buttons.save = {
      'action': function() {
        that.save(function() {
          that.options = that.optionsSet.default;
          that.editMode = false;
        });
      },
      'label': 'Sauvegarder',
      classes: 'btn-success',
      'icon': 'fa-floppy-o '
    };

    this.buttons.edit = {
      'action': function() {
        that.options = that.optionsSet.editMode;
        that.editMode = true;
      },
      'label': 'Modifier',
      classes: 'btn-default',
      'icon': 'fa-edit'
    };

    this.buttons.delete = {
      'action': function() {

        that.svgEditor.$rootScope.$emit('RightPopupShow', 'Supprimer', '', [{
          'label': 'Confirmer',
          classes: 'btn-success',
          icon: 'fa-trash-o',
          action: function(callback) {
            that.removeFromDatabase(function(res) {
              if (res.status === 'OK') {
                that.remove();
                geoP.notifications.done('L\'objet a été supprimé.');
                that.options = that.optionsSet.default;
                that.editMode = false;
                return callback(res);
              }
              geoP.notifications.error('Impossible de supprimer l\'objet ' + that.json.fullname);
            });
          }
        }]);

      },
      'label': 'Supprimer',
      classes: 'btn-danger',
      'icon': 'fa-trash-o'
    };


    this.buttons.cancel = {
      'action': function() {
        that.options = [that.buttons.edit, that.buttons.zoom];
        that.editMode = false;
      },
      'label': 'Annuler',
      classes: 'btn-warning',
      'icon': 'fa-ban'
    };

    that.optionsSet = {
      default: [that.buttons.edit, that.buttons.zoom],
      editMode: [that.buttons.save, that.buttons.cancel, that.buttons.delete]
    };

    that.options = that.optionsSet.default;
  };

  ItemSvg.prototype.remove = function() {
    this.circleSvg.remove();
  };

  ItemSvg.prototype.removeFromDatabase = function(callback) {
    this.svgEditor.$http.delete('/items/' + this.json.id).success(callback).error(function() {
      return callback({
        'status': 'KO'
      });
    });
  };

  ItemSvg.prototype.zoomOnItem = function() {
    var box, spaceAround = 300;
    box = {
      x: this.json.x,
      y: this.json.y
    };
    box.w = spaceAround;
    box.h = spaceAround;
    box.x -= spaceAround / 2;
    box.y -= spaceAround / 2;
    this.svgEditor.centerOnBox(box);
  };


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
    h.push(this.json.x, this.json.y, this.json.item_quality_id);
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
      this.svgEditor.$http.put('/items/' + this.json.id + '.json', data).success(function(res) {
        geoP.notifications.done('L\'objet de type ' + that.json.item_type.name + ' a été sauvegardée.');
        that.updateHashCode();
        that.json = res;
        return callback && callback();
      }).error(function() {
        console.error('impossible to update the item');
      });
    }
  };

  ItemSvg.prototype.select = function(e) {
    var that = this;
    geoP.currentEvent = e;
    this.room.unSelectItems();
    this.circleSvg.node.setAttribute('class', 'item-selected');

    geoP.updateHashWithItemId(that.json.id);
    this.svgEditor.$scope.$apply(function() {
      that.svgEditor.$scope.item = that;
    });
  };

  ItemSvg.prototype.addToEditor = function() {
    var that = this;
    this.circleSvg = this.svgEditor.canvas.circle(this.json.x, this.json.y, 5);
    this.circleSvg.attr({
      fill: this.json.color
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
    });

    // select the item if coming from the url param

    if (this.svgEditor.$scope.itemId === this.json.id) {
      this.select();
    }

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
