/*global GeoP:true*/
(function(geoP) {
  'use strict';

  var MapFilter, MapFilterHelper;

  MapFilter = function($rootScope, $http, buildingId) {
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

    filterObj.clickOnFilter = function(filter) {
      filter.state = !filter.state;
      that.updateFilterStateAndContext(filterName, filter);
    };

    function iterateAllFiltersAndUpateState(action) {
      var key, filter;
      for (key in filterObj.filters.names) {
        if (filterObj.filters.names.hasOwnProperty(key)) {
          filter = filterObj.filters.names[key];
          filter.state = filterObj.checkAll;
          that.updateFilterState(filterName, filter);
          if (action !== undefined) {
            action.call(that, filter);
          }
        }
      }
    }

    filterObj.CheckAll = function() {
      // debugger;
      if (filterName === 'direction') {
        iterateAllFiltersAndUpateState(that.updateColorsForDirection);
      } else {
        iterateAllFiltersAndUpateState();
        that.updateContextAfterFilterStateChange(filterName);
      }
      that.updateCuby(filterName);
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
      this.createParentOrganizationFilter(that.floorJsons[j]);
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


  function addKpiToKpi(source, target) {
    var allPeople;
    source.count += target.count;
    source.nbPeople += target.nbPeople;
    source.areaSum += target.areaSum;
    source.perimeterSum += target.perimeterSum;
    // source.ratio += n.ratio;
    source.freeDeskNumberSum += target.freeDeskNumberSum;
    allPeople = source.nbPeople + source.freeDeskNumberSum;

    source.count = parseFloat(source.count.toFixed(1), 10);
    source.nbPeople = parseFloat(source.nbPeople.toFixed(1), 10);
    source.areaSum = parseFloat(source.areaSum.toFixed(1), 10);
    source.perimeterSum = parseFloat(source.perimeterSum.toFixed(1), 10);
    if (allPeople === 0) {
      source.ratio = 0;
    } else {
      source.ratio = parseFloat((source.areaSum / allPeople).toFixed(1), 10);
    }
    source.freeDeskNumberSum = parseFloat(source.freeDeskNumberSum.toFixed(1), 10);
    return source;
  }

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
                      addKpiToKpi(o, n);
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

  MapFilter.prototype.updateFilterState = function(filterName, item) {
    this.bfilters[this.buildingId].belongsToItems[filterName][item.id] = item;
  };


  MapFilter.prototype.updateColorsForDirection = function(item) {
    var j, childrenIdList;
    childrenIdList = item.organizations.map(function(o) {
      return o.id;
    });

    function keepElementInChildrenList(i) {
      return i.element !== undefined && childrenIdList.indexOf(i.json.organization_id) !== -1;
    }

    function fillWithColorOfItem(i) {
      i.fillWithColorDependingOnState(item.color, item.state);
    }
    for (j = 0; j < this.editors.length; j += 1) {
      this.editors[j].items.filter(keepElementInChildrenList).forEach(fillWithColorOfItem);
      this.editors[j].setLegend();
    }
  };

  MapFilter.prototype.updateFilterStateAndContext = function(filterName, item) {
    if (filterName === 'direction') {
      this.updateColorsForDirection(item);
    } else {
      this.updateFilterState(filterName, item);
      this.updateContextAfterFilterStateChange(filterName);
    }
    this.updateCuby(filterName);
  };


  MapFilter.prototype.updateContextAfterFilterStateChange = function(filterName) {
    var j;
    for (j = 0; j < this.editors.length; j += 1) {
      this.editors[j].mapOnItems('fillFromFilterColor', filterName);
      this.editors[j].setLegend();
    }
  };

  MapFilter.prototype.updateCuby = function(filterName) {
    if (this.cuby !== null) {
      this.cuby.applyFilters(filterName);
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
    this.ready();
    if (this.$rootScope.mapFilterByBuildingId === undefined) {
      this.$rootScope.mapFilterByBuildingId = {};
    }
    this.$rootScope.mapFilterByBuildingId[this.buildingId] = this;
  };

  MapFilterHelper = {};

  MapFilterHelper.getInitKpi = function() {
    return {
      count: 0,
      nbPeople: 0,
      areaSum: 0,
      perimeterSum: 0,
      ratio: 0,
      freeDeskNumberSum: 0
    };
  };

  geoP.MapFilterHelper = MapFilterHelper;

  MapFilter.prototype.createParentOrganizationFilter = function(floorJson) {
    // return;
    var buildingId, floorId, belongsToKeyName = 'direction',
      orgs, orgId, parentOrgs = {},
      parentOrgsKpi = {};
    buildingId = floorJson.building.id;
    floorId = floorJson.id;
    this.initBuildingFilter(buildingId, floorId, belongsToKeyName);

    // for each leaf org, fetch the parent
    orgs = this.bfilters[buildingId].belongsToItems.organization;
    for (orgId in orgs) {
      if (orgs.hasOwnProperty(orgId)) {
        if (orgs[orgId].organization !== undefined) {
          parentOrgs[orgs[orgId].organization.id] = orgs[orgId].organization;
          parentOrgs[orgs[orgId].organization.id].state = false;
          if (this.bfilters[buildingId][floorId].organization[orgId] !== undefined) {
            if (parentOrgsKpi[orgs[orgId].organization.id] === undefined) {
              parentOrgsKpi[orgs[orgId].organization.id] = geoP.MapFilterHelper.getInitKpi();
            }
            addKpiToKpi(parentOrgsKpi[orgs[orgId].organization.id], this.bfilters[buildingId][floorId].organization[orgId]);
          }
        }
      }
    }

    this.bfilters[buildingId].belongsToItems[belongsToKeyName] = parentOrgs;
    this.bfilters[buildingId][floorId][belongsToKeyName] = parentOrgsKpi;
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
        if (kpis[belongsToItem.id] === undefined) {
          kpis[belongsToItem.id] = geoP.MapFilterHelper.getInitKpi();
        }
        belongsToKpi = kpis[belongsToItem.id];
        belongsToKpi.count += 1;
        belongsToKpi.areaSum += room.area;
        belongsToKpi.perimeterSum += room.perimeter;
        belongsToKpi.nbPeople += room.affectations.length;
        belongsToKpi.freeDeskNumberSum += room.free_desk_number;
      }
    }
    // clean the results output format and update ratio
    Object.keys(kpis).forEach(function(eId) {
      var peopleCount, kpiObject = kpis[eId];
      kpiObject.areaSum = parseFloat(kpiObject.areaSum.toFixed(1), 10);
      kpiObject.perimeterSum = parseFloat(kpiObject.perimeterSum.toFixed(1), 10);
      peopleCount = kpiObject.nbPeople + kpiObject.freeDeskNumberSum;
      if (peopleCount === 0) {
        kpiObject.ratio = 0;
      } else {
        ratio = kpiObject.areaSum / peopleCount;
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
    if (filter.names !== undefined) {
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
        return 0;
      });
    }
    return filter;
  };

  MapFilter.prototype.loadBelongsToFilter = function(floorJson, belongsToKeyName) {
    this.loadBelongsToData(floorJson, belongsToKeyName);
  };

  geoP.MapFilter = MapFilter;

}(GeoP));
