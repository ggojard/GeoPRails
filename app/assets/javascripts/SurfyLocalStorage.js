/*global GeoP, gon*/

(function(geoP) {
  'use strict';

  geoP.ls = (function() {
    // localStorage.clear();
    function set(key, value) {
      if (localStorage !== undefined) {
        var container = {};
        if (localStorage.surfy !== undefined) {
          container = JSON.parse(localStorage.surfy);
        }
        container[key] = value;
        localStorage.surfy = JSON.stringify(container);
      }
    }

    function get(key) {
      if (localStorage !== undefined && localStorage.surfy !== undefined) {
        var container = JSON.parse(localStorage.surfy);
        return container[key];
      }
    }

    function getB(key, buildingId) {
      return get(key + '-' + buildingId);
    }

    function setB(key, buildingId, value) {
      return set(key + '-' + buildingId, value);
    }

    return {
      get: get,
      set: set,
      getB: getB,
      setB: setB
    };
  }());

}(GeoP));
