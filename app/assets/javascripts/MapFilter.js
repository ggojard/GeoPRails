/*global GeoP:true, jQuery:true*/
(function(geoP, $) {
  'use strict';

  var MapFilter = function($rootScope, $http, buildingId) {
    this.filters = {};
    this.bfilters = {};
    this.editors = [];
    this.editorsByFloorId = {};
    this.floorJsonById = {};
    this.floorJsons = [];
    this.$rootScope = $rootScope;
    if (this.$rootScope.mapFilter === undefined) {
      this.$rootScope.mapFilter = {};
    }
    this.$rootScope.mapFilter[buildingId] = this;
    if (this.$rootScope.f === undefined) {
      this.$rootScope.f = {};
    }
    this.$http = $http;
    this.buildingId = buildingId;
    this.mergedFiltersForBuildings = {};
    this.cuby = null;
    this.registerFilters(buildingId);
  };


  MapFilter.prototype.addFloorJson = function(floorJson) {
    this.floorJsons.push(floorJson);
    this.floorJsonById[floorJson.id] = floorJson;
  };

  MapFilter.prototype.addEditor = function(editor) {
    if (editor !== null && editor !== undefined) {
      this.editors.push(editor);
      this.editorsByFloorId[editor.json.id] = editor;
    }
  };

  MapFilter.prototype.ready = function() {
    this.$rootScope.$emit('MapFilter.Ready', this);
  };


  MapFilter.prototype.loadFilter = function(floorJson) {
    var filtersNames = GeoP.filtersNames,
      i, that = this;

    function load(filterName) {
      that.loadBelongsToFilter(floorJson, filterName);
    }
    for (i = 0; i < filtersNames.length; i += 1) {
      load(filtersNames[i].name);
    }
  };

  function hexToRgba(hex) {
    var result, resVar;
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
      /*jslint unparam:true*/
      return r + r + g + g + b + b;
    });

    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    resVar = result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
    return ['rgba(', resVar.r, ',', resVar.g, ',', resVar.b, ',', 0.69, ')'].join('');
  }

  function updateFilterColors(filterObj) {
    var key, filter;
    for (key in filterObj.filters.names) {
      if (filterObj.filters.names.hasOwnProperty(key)) {
        filter = filterObj.filters.names[key];
        filter.colorOpacity = hexToRgba(filter.color);
      }
    }
  }

  MapFilter.prototype.registerFilterCtrl = function(buildingId, filterName) {
    var filterObj = {},
      that = this;
    filterObj.checkAll = false;
    filterObj.filterStateChange = function(filter) {
      that.$rootScope.$emit(filterName + '_filters.StateChange', filter);
    };
    filterObj.clickOnFilter = function(filter) {
      filter.state = !filter.state;
      that.$rootScope.$emit(filterName + '_filters.StateChange', filter);
    };

    filterObj.CheckAll = function() {
      var key, filter;
      for (key in filterObj.filters.names) {
        if (filterObj.filters.names.hasOwnProperty(key)) {
          filter = filterObj.filters.names[key];
          filter.state = filterObj.checkAll;
          that.$rootScope.$emit(filterName + '_filters.StateChange', filter);
        }
      }
    };

    if (this.$rootScope.f[buildingId] === undefined) {
      this.$rootScope.f[buildingId] = {};
    }
    this.$rootScope.f[buildingId][filterName] = filterObj;
  };


  MapFilter.prototype.registerFilters = function(buildingId) {
    var i, filter;
    for (i = 0; i < geoP.filtersNames.length; i += 1) {
      filter = geoP.filtersNames[i];
      this.registerFilterCtrl(buildingId, filter.name);
    }
  };

  MapFilter.prototype.loadFilters = function() {
    var j, that = this,
      bId, mergedFilters, fName;
    for (j = 0; j < that.floorJsons.length; j += 1) {
      this.loadFilter(that.floorJsons[j]);
    }
    this.createMergedFiltersByBuilding();
    bId = this.buildingId;
    mergedFilters = this.mergedFiltersForBuildings[bId];
    for (fName in mergedFilters) {
      if (mergedFilters.hasOwnProperty(fName)) {
        that.$rootScope.f[bId][fName].filters = this.getFilterForBelongsToKeyName(bId, fName);
        updateFilterColors(that.$rootScope.f[bId][fName]);
      }
    }
  };

  MapFilter.prototype.createMergedFiltersByBuilding = function() {
    var bId, filtersForFloorObject, belongsToName, belongsToId, fId, o, n;
    for (bId in this.bfilters) {
      if (this.bfilters.hasOwnProperty(bId)) {
        for (fId in this.bfilters[bId]) {
          if (this.bfilters[bId].hasOwnProperty(fId) && fId !== 'belongsToItems') {
            filtersForFloorObject = this.bfilters[bId][fId];
            if (this.mergedFiltersForBuildings[bId] === undefined) {
              this.mergedFiltersForBuildings[bId] = {};
            }
            for (belongsToName in filtersForFloorObject) {
              if (filtersForFloorObject.hasOwnProperty(belongsToName)) {
                if (this.mergedFiltersForBuildings[bId][belongsToName] === undefined) {
                  this.mergedFiltersForBuildings[bId][belongsToName] = {};
                }
                for (belongsToId in filtersForFloorObject[belongsToName]) {
                  if (filtersForFloorObject[belongsToName].hasOwnProperty(belongsToId)) {

                    if (this.mergedFiltersForBuildings[bId][belongsToName][belongsToId] === undefined) {
                      this.mergedFiltersForBuildings[bId][belongsToName][belongsToId] = filtersForFloorObject[belongsToName][belongsToId];
                    } else {
                      o = this.mergedFiltersForBuildings[bId][belongsToName][belongsToId];
                      n = filtersForFloorObject[belongsToName][belongsToId];
                      o.count += n.count;
                      o.nbPeople += n.nbPeople;
                      o.areaSum += n.areaSum;
                      o.perimeterSum += n.perimeterSum;
                      o.ratio += n.ratio;

                      o.count = parseFloat(o.count.toFixed(1), 10);
                      o.nbPeople = parseFloat(o.nbPeople.toFixed(1), 10);
                      o.areaSum = parseFloat(o.areaSum.toFixed(1), 10);
                      o.perimeterSum = parseFloat(o.perimeterSum.toFixed(1), 10);
                      o.ratio = parseFloat(o.ratio.toFixed(1), 10);
                      this.mergedFiltersForBuildings[bId][belongsToName][belongsToId] = o;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  MapFilter.prototype.registerFilterStateChange = function(belongsToKeyName, callback) {
    var that = this;
    this.$rootScope.$on(belongsToKeyName + '_filters.StateChange', function(e, item) {
      that.bfilters[that.buildingId].belongsToItems[belongsToKeyName][item.id] = item;
      return callback(e, item);
    });
  };

  MapFilter.prototype.registerFiltersStateChange = function() {
    var that = this,
      filtersNames = geoP.filtersNames,
      j, i;

    function register(filterName) {
      that.registerFilterStateChange(filterName, function() {
        for (j = 0; j < that.editors.length; j += 1) {
          that.editors[j].mapOnItems('fillFromFilterColor', filterName);
          that.editors[j].setLegend();
        }
        if (that.cuby !== null) {
          that.cuby.applyFilters(filterName);
        }
      });
    }
    for (i = 0; i < filtersNames.length; i += 1) {
      register(filtersNames[i].name);
    }
  };

  MapFilter.prototype.initBuildingFilter = function(buildingId, floorId, belongsToKeyName) {
    if (this.bfilters[buildingId] === undefined) {
      this.bfilters[buildingId] = {};
    }

    if (this.bfilters[buildingId].belongsToItems === undefined) {
      this.bfilters[buildingId].belongsToItems = {};
    }


    if (this.bfilters[buildingId][floorId] === undefined) {
      this.bfilters[buildingId][floorId] = {};
    }


    if (this.bfilters[buildingId][floorId] === undefined) {
      this.bfilters[buildingId][floorId] = {};
    }
    if (this.bfilters[buildingId][floorId][belongsToKeyName] === undefined) {
      this.bfilters[buildingId][floorId][belongsToKeyName] = {};
    }
  };

  MapFilter.prototype.setup = function() {
    this.loadFilters();
    this.registerFiltersStateChange();
    this.ready();
    if (this.$rootScope.mapFilterByBuildingId === undefined) {
      this.$rootScope.mapFilterByBuildingId = {};
    }
    this.$rootScope.mapFilterByBuildingId[this.buildingId] = this;
  };


  MapFilter.prototype.updateEditorsRoomPositions = function() {
    this.editors.forEach(function(editor) {
      if (editor.paper !== null && $(editor.paper.node).find('g.select').length > 0) {
        editor.updateRoomOffset();
      }
    });
  };

  MapFilter.prototype.loadBelongsToData = function(floorJson, belongsToKeyName) {
    var i, room, buildingId, floorId, belongsToKpi, ratio, belongsToItem, kpis;

    buildingId = floorJson.building.id;
    floorId = floorJson.id;

    this.initBuildingFilter(buildingId, floorId, belongsToKeyName);

    kpis = {};

    for (i = 0; i < floorJson.rooms.length; i += 1) {
      room = floorJson.rooms[i];
      belongsToItem = room[belongsToKeyName];
      if (belongsToItem !== undefined && belongsToItem !== null) {


        if (this.bfilters[buildingId].belongsToItems[belongsToKeyName] === undefined) {
          this.bfilters[buildingId].belongsToItems[belongsToKeyName] = {};
        }

        belongsToItem.state = false;
        this.bfilters[buildingId].belongsToItems[belongsToKeyName][belongsToItem.id] = belongsToItem;
        // this.bfilters[buildingId].belongsToItems[belongsToKeyName].state = false;

        if (kpis[belongsToItem.id] === undefined) {
          kpis[belongsToItem.id] = {
            count: 0,
            nbPeople: 0,
            areaSum: 0,
            perimeterSum: 0,
            ratio: 0
          };
        }
        belongsToKpi = kpis[belongsToItem.id];
        belongsToKpi.count += 1;
        belongsToKpi.areaSum += room.area;
        belongsToKpi.perimeterSum += room.perimeter;
        belongsToKpi.nbPeople += room.affectations.length;
      }
    }
    // clean the results
    Object.keys(kpis).forEach(function(eId) {
      var kpiObject = kpis[eId];
      kpiObject.areaSum = parseFloat(kpiObject.areaSum.toFixed(1), 10);
      kpiObject.perimeterSum = parseFloat(kpiObject.perimeterSum.toFixed(1), 10);
      if (kpiObject.nbPeople === 0) {
        kpiObject.ratio = 0;
      } else {
        ratio = kpiObject.areaSum / kpiObject.nbPeople;
        kpiObject.ratio = parseFloat(ratio.toFixed(1), 10);
      }
      kpis[eId] = kpiObject;
    });

    this.bfilters[buildingId][floorId][belongsToKeyName] = kpis;
  };

  MapFilter.prototype.getFilterForBelongsToKeyName = function(buildingId, belongsToKeyName) {
    var filter, names, i;
    filter = {
      names: this.bfilters[buildingId].belongsToItems[belongsToKeyName],
      values: this.mergedFiltersForBuildings[buildingId][belongsToKeyName]
    };
    filter.sortedNames = [];
    names = Object.keys(filter.names);
    for (i = 0; i < names.length; i += 1) {
      filter.sortedNames.push(filter.names[names[i]]);
    }
    filter.sortedNames.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // a doit être égale à b
      return 0;
    });
    return filter;
  };

  MapFilter.prototype.loadBelongsToFilter = function(floorJson, belongsToKeyName) {
    this.loadBelongsToData(floorJson, belongsToKeyName);
  };

  geoP.MapFilter = MapFilter;

}(GeoP, jQuery));
