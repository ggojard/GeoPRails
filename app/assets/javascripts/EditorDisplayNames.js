/*global GeoP, gon, jQuery*/
(function(geoP) {
  'use strict';

  var editorDisplayNames;

  geoP.displayNames = (function() {

    function getDisplayNames(buildingId) {
      var displayNamesByName, storedDisplayNames, p;

      storedDisplayNames = geoP.ls.getB('displayName', buildingId);
      if (storedDisplayNames !== undefined) {
        displayNamesByName = {};
        storedDisplayNames.map(function(displayName) {
          displayNamesByName[displayName.name] = displayName;
        });
      }

      function getDisplayNameFilter(name, value, format, merge) {
        if (value === undefined) {
          value = false;
        }
        var res = {
          name: name,
          label: gon.i18n.room[name],
          value: value,
          merge: true,
          order: 0,
          format: function(v) {
            return [v];
          }
        };
        if (format !== undefined) {
          res.format = format;
        }
        if (merge !== undefined) {
          res.merge = merge;
        }
        if (displayNamesByName !== undefined && displayNamesByName[name] !== undefined) {
          res.order = displayNamesByName[name].order;
          res.value = displayNamesByName[name].value;
        }
        return res;
      }
      p = [];
      p.push(getDisplayNameFilter('name', true));
      p.push(getDisplayNameFilter('area', true, function(v) {
        return [v.toFixed(2) + ' m²'];
      }));
      p.push(getDisplayNameFilter('ratio', true, function(v) {
        return [v === undefined ? '' : parseFloat(v, 10).toFixed(1) + ' m² / p.'];
      }));
      p.push(getDisplayNameFilter('perimeter', false, function(v) {
        return [v + ' m'];
      }));
      p.push(getDisplayNameFilter('network', false, function(v) {
        return v.split('\r\n');
      }));
      p.push(getDisplayNameFilter('free_desk_number', false, function(v) {
        if (v === 1) {
          return [v + ' place libre'];
        }
        return [v + ' places libres'];
      }));
      p.push(getDisplayNameFilter('capacity', false, function(v) {
        if (v === 1) {
          return [v + ' place'];
        }
        return [v + ' places'];
      }));
      p.push(getDisplayNameFilter('affectations', false, function(v) {
        return v.filter(function(f) {
          return f.person !== undefined;
        }).map(function(m) {
          if (m.workplace_name !== null && m.workplace_name.length > 0) {
            return geoP.format('{0} ({1})', m.person.fullname, m.workplace_name);
          }
          return m.person.fullname;
        });
      }, false));

      p.push(getDisplayNameFilter('inventories', false, function(v) {
        return v.filter(function(f) {
          return f.item_type !== undefined;
        }).map(function(m) {
          return m.quantity + ' x ' + m.item_type.name;
        });
      }, false));

      p = p.sort(function(a, b) {
        return a.order > b.order;
      });
      return p;
    }

    return {
      getDisplayNames: getDisplayNames
    };

  }());

  editorDisplayNames = function($scope, $rootScope, buildingId) {
    $scope.updateDisplayText = function(buildingId) {
      var mapFilter;

      mapFilter = $rootScope.mapFilterByBuildingId[buildingId];
      if (mapFilter !== undefined) {
        mapFilter.editors.forEach(function(editor) {
          editor.updateDisplayNames($scope.displayNamesList[buildingId]);
        });
      }
      geoP.ls.setB('displayName', buildingId, $scope.displayNamesList[buildingId]);
    };

    if ($scope.displayNamesList === undefined) {
      $scope.displayNamesList = {};
    }
    $scope.displayNamesList[buildingId] = geoP.displayNames.getDisplayNames(buildingId);
    if ($scope.dragControlListeners === undefined) {
      $scope.dragControlListeners = {};
    }

    $scope.dragControlListeners[buildingId] = {
      containment: 'ul.display-text',
      accept: function() {
        return true;
      },
      orderChanged: function() {
        var i;
        for (i = 0; i < $scope.displayNamesList[buildingId].length; i += 1) {
          $scope.displayNamesList[buildingId][i].order = i;
        }
        $scope.updateDisplayText(buildingId);
      }
    };
  };

  geoP.editorDisplayNames = editorDisplayNames;
}(GeoP));
