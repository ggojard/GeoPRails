(function(geoP) {

  var MapFilter = function($rootScope) {
    this.filters = {};
    this.editors = [];
    this.$rootScope = $rootScope;
  };

  MapFilter.prototype.addEditor = function(editor) {
    this.editors.push(editor);
  };

  MapFilter.prototype.ready = function() {
    this.$rootScope.$emit('MapFilter.Ready', this);

  };

  MapFilter.prototype.resisterFilterStateChange = function(belongsToKeyName, callback) {
    var that = this;
    this.$rootScope.$on(belongsToKeyName + '_filters.StateChange', function(e, item) {
      that.filters[belongsToKeyName][item.id] = item;
      return callback(e, item);
    });
  };

  MapFilter.prototype.registerFiltersStateChange = function() {
    var that = this;
    var filtersNames = GeoP.filtersNames;

    function register(filterName) {
      that.resisterFilterStateChange(filterName, function(e, item) {
        for (var j = 0; j < that.editors.length; j++) {
          that.editors[j].mapOnItems('fillFromFilterColor', filterName);
        }
      });
    }

    for (var i = 0; i < filtersNames.length; i++) {
      register(filtersNames[i].name);
    }
  };

  geoP.MapFilter = MapFilter;

}(GeoP));