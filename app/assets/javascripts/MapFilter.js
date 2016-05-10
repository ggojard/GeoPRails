/*global GeoP:true*/
(function (geoP) {
  'use strict';

  var MapFilter, MapFilterHelper, localId = 0;

  MapFilter = function ($rootScope, $http, buildingId) {
    this.localId = localId;
    localId += 1;
    this.selectedFilters = {};

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
  };


  MapFilter.prototype.addFloorJson = function (floorJson) {
    this.floorJsons.push(floorJson);
    this.floorJsonById[floorJson.id] = floorJson;
  };

  MapFilter.prototype.addEditor = function (editor) {
    if (editor !== null && editor !== undefined) {
      this.editors.push(editor);
      this.editorsByFloorId[editor.json.id] = editor;
    }
  };

  MapFilter.prototype.ready = function () {
    this.$rootScope.$emit('MapFilter.Ready', this);
  };

  MapFilter.prototype.hasFilter = function (filterName) {
    if (this.filters[filterName] === undefined) {
      return false;
    }
    return Object.keys(this.filters[filterName]).length > 0;
  };

  MapFilter.prototype.isSelected = function (filterName, rtId) {
    return this.selectedFilters[filterName] !== undefined && this.selectedFilters[filterName][rtId] !== undefined && this.selectedFilters[filterName][rtId] === true;
  };

  MapFilter.prototype.select = function (filterName, rtId, updateEditorContext) {
    if (this.selectedFilters[filterName] === undefined) {
      this.selectedFilters[filterName] = {};
    }
    this.selectedFilters[filterName][rtId] = true;
    if (updateEditorContext === undefined || updateEditorContext === true) {
      this.updateFilterStateAndContext(filterName);
    }
  };

  MapFilter.prototype.unSelect = function (filterName, rtId, updateEditorContext) {
    if (this.selectedFilters[filterName] === undefined) {
      this.selectedFilters[filterName] = {};
    }
    this.selectedFilters[filterName][rtId] = false;
    if (updateEditorContext === undefined || updateEditorContext === true) {
      this.updateFilterStateAndContext(filterName);
    }
  };

  MapFilter.prototype.clickOnFilter = function (filterName, rtId) {
    if (!this.isSelected(filterName, rtId)) {
      this.select(filterName, rtId);
    } else {
      this.unSelect(filterName, rtId);
    }
    this.selectedFilters[filterName].all = false;
  };

  MapFilter.prototype.checkAll = function (filterName) {
    var item_id;
    if (this.selectedFilters[filterName] === undefined) {
      this.selectedFilters[filterName] = {
        all: false
      };
    }
    // toggle
    this.selectedFilters[filterName].all = !this.selectedFilters[filterName].all;

    // select all the items for this filter
    for (item_id in this.filters[filterName]) {
      if (this.filters[filterName].hasOwnProperty(item_id)) {
        if (this.selectedFilters[filterName].all === true) {
          this.select(filterName, item_id, false);
        } else {
          this.unSelect(filterName, item_id, false);
        }
      }
    }
    this.setLegendOnEditors();
  };

  MapFilter.prototype.getSelectedItemsForFilter = function (filterName) {
    var filterId, selected = [];
    for (filterId in this.selectedFilters[filterName]) {
      if (this.selectedFilters[filterName].hasOwnProperty(filterId) && filterId !== 'all') {
        if (this.selectedFilters[filterName][filterId] === true) {
          selected.push(filterId);
        }
      }
    }
    return selected;
  };

  MapFilter.prototype.isCheckAll = function (filterName) {
    return this.selectedFilters[filterName] !== undefined && this.selectedFilters[filterName].all === true;
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

  MapFilter.prototype.setLegendOnEditors = function () {
    var j;
    for (j = 0; j < this.editors.length; j += 1) {
      this.editors[j].setLegend();
    }
  };

  MapFilter.prototype.updateColorsForDirection = function (item) {
    var j, childrenIdList;
    childrenIdList = item.organizations.map(function (o) {
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

  MapFilter.prototype.updateFilterStateAndContext = function (filterName) {
    this.updateContextAfterFilterStateChange(filterName);

    // if (filterName === 'direction') {
    //   this.updateColorsForDirection(item);
    // } else {
    //   this.updateFilterState(filterName, item);
    //   this.updateContextAfterFilterStateChange(filterName);
    // }
    this.updateCuby(filterName);
  };


  MapFilter.prototype.updateContextAfterFilterStateChange = function (filterName) {
    var j;
    for (j = 0; j < this.editors.length; j += 1) {
      this.editors[j].mapOnItems('fillFromFilterColor', filterName);
      this.editors[j].setLegend();
    }
  };

  MapFilter.prototype.updateCuby = function (filterName) {
    if (this.cuby !== null) {
      this.cuby.applyFilters(filterName);
    }
  };

  MapFilter.prototype.setup = function () {
    if (this.$rootScope.mapFilterByBuildingId === undefined) {
      this.$rootScope.mapFilterByBuildingId = {};
    }
    this.$rootScope.mapFilterByBuildingId[this.buildingId] = this;
  };

  MapFilterHelper = {};

  MapFilterHelper.getInitKpi = function () {
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

  MapFilter.prototype.createParentOrganizationFilter = function (floorJson) {
    // return;
    var buildingId, floorId, belongsToKeyName = 'direction',
      orgs, orgId, parentOrgs = {},
      parentOrgsKpi = {};
    buildingId = floorJson.building.id;
    floorId = floorJson.id;
    // this.initBuildingFilter(buildingId, floorId, belongsToKeyName);

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

  geoP.MapFilter = MapFilter;

}(GeoP));