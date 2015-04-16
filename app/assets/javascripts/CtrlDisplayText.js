/*global GeoP:true, gon:true, jQuery:true*/
(function(geoP, $) {
  'use strict';
  geoP.app.controller('DisplayTextCtrl', function($scope, $rootScope) {

    var storedDisplayNames, displayNamesByName, p;
    if (localStorage && localStorage.displayNames !== undefined) {
      storedDisplayNames = JSON.parse(localStorage.displayNames);
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
    p.push(getDisplayNameFilter('perimeter', false, function(v) {
      return [v + ' m'];
    }));
    p.push(getDisplayNameFilter('network', false, function(v) {
      return v.split('\r\n');
    }));
    p.push(getDisplayNameFilter('free_desk_number', false, function(v) {
      if (v === 1) {
        return [v + ' place libre'];
      } else {
        return [v + ' places libres'];
      }
    }));

    p.push(getDisplayNameFilter('affectations', false, function(v) {
      return v.filter(function(f) {
        return f.person !== undefined;
      }).map(function(m) {
        return m.person.fullname;
      });
    }, false));

    p = p.sort(function(a, b) {
      return a.order > b.order;
    });

    $scope.updateDisplayText = function() {
      $rootScope.$emit('DisplayNames.Update', $scope.properties);
      if (localStorage) {
        localStorage.displayNames = JSON.stringify($scope.properties);
      }
    };

    $rootScope.buildings.forEach(function(bId) {
      var $displayTextContent = $('#display-text-' + bId + '-content');

      $displayTextContent.on('shown.bs.collapse', function() {
        $rootScope.mapFilter.updateEditorsRoomPositions();
      });
      $displayTextContent.on('hidden.bs.collapse', function() {
        $rootScope.mapFilter.updateEditorsRoomPositions();
      });
    });

    $scope.properties = p;
    $rootScope.displayNames = p;

    $scope.dragControlListeners = {
      accept: function() {
        return true;
      },
      orderChanged: function() {
        var i;
        for (i = 0; i < $scope.properties.length; i += 1) {
          $scope.properties[i].order = i;
        }
        $scope.updateDisplayText();
      },
      containment: '#display-text-content'
    };
    $scope.updateDisplayText();

  });
}(GeoP, jQuery));
