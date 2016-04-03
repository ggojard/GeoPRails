/*global GeoP*/

(function(geoP) {
  'use strict';


  function ItemHandler($http) {
    this.$http = $http;
    this.searchItem = null;
    this.itemTypes = null;
    this.items = [];
  }

  ItemHandler.prototype.addItemTypeToRoom = function(room, itemType) {
    var itemSvg = new geoP.ItemSvg(room);
    itemSvg.create(this.$http, itemType);
  };

  ItemHandler.prototype.fetch = function() {
    var that = this;
    this.items = [];
    if (this.searchItem !== undefined && this.searchItem !== null && this.searchItem.length > 2) {
      this.$http.get('/items/search_to_add/' + this.searchItem).success(function(res) {
        that.items = res;
      });
    }
    if (this.itemTypes === null && this.qItemTypes === undefined) {
      // fetch items types at first search
      this.qItemTypes = this.$http.get('/item_types.json').success(function(res) {
        that.itemTypes = res;
      });
    }
  };

  geoP.ItemHandler = ItemHandler;

}(GeoP));
