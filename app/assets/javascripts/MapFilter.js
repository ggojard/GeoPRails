/*global GeoP:true*/
(function(geoP) {
  'use strict';

  var MapFilter = function($rootScope) {
    this.filters = {};
    this.bfilters = {};
    this.editors = [];
    this.$rootScope = $rootScope;
    this.mergedFiltersForBuildings = {};
  };

  MapFilter.prototype.addEditor = function(editor) {
    this.editors.push(editor);
  };

  MapFilter.prototype.ready = function() {
    this.$rootScope.$emit('MapFilter.Ready', this);
  };


  MapFilter.prototype.loadFilter = function(editor) {
    var filtersNames = GeoP.filtersNames,
      i, that = this;

    function load(filterName) {
      that.loadBelongsToFilter(editor.json, filterName);
    }
    for (i = 0; i < filtersNames.length; i += 1) {
      load(filtersNames[i].name);
    }
  };

  MapFilter.prototype.loadFilters = function() {
    var j, that = this,
      bId, mergedFilters, fName;
    for (j = 0; j < that.editors.length; j += 1) {
      this.loadFilter(that.editors[j]);
    }
    this.createMergedFiltersByBuilding();

    bId = this.$rootScope.currentBuildingId;
    mergedFilters = this.mergedFiltersForBuildings[bId];
    for (fName in mergedFilters) {
      if (mergedFilters.hasOwnProperty(fName)) {
        this.$rootScope.$emit(fName + '_filters.Update', this.getFilterForBelongsToKeyName(bId, fName));
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
      that.bfilters[that.$rootScope.currentBuildingId].belongsToItems[belongsToKeyName][item.id] = item;
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
    // var buildingId, floorId;
    // buildingId = floorJson.building.id;
    // floorId = floorJson.id;

    console.log('getFilterForBelongsToKeyName', belongsToKeyName);
    // console.log(belongsToKeyName, this.bfilters[buildingId][floorId][belongsToKeyName]);
    return {
      names: this.bfilters[buildingId].belongsToItems[belongsToKeyName],
      values: this.mergedFiltersForBuildings[buildingId][belongsToKeyName]
    };
  };

  MapFilter.prototype.loadBelongsToFilter = function(floorJson, belongsToKeyName) {
    this.loadBelongsToData(floorJson, belongsToKeyName);
    // this.$rootScope.$emit(belongsToKeyName + '_filters.Update', this.getFilterForBelongsToKeyName(floorJson, belongsToKeyName));
  };

  geoP.MapFilter = MapFilter;

}(GeoP));
