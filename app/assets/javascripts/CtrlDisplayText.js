/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('DisplayTextCtrl', function($scope, $rootScope) {

    function getDisplayNameFilter(name, value) {
      if (value === undefined) {
        value = false;
      }
      return {
        name: 'name',
        label: gon.i18n.room[name],
        value: value,
        format: function(v) {
          return v;
        }
      };
    }

    var p = {};
    p.name = getDisplayNameFilter('name', true);
    p.area = getDisplayNameFilter('area', true);
    p.network = getDisplayNameFilter('network', false);
    p.affectations = getDisplayNameFilter('affectations', false);

    p.area.format = function(v) {
      return v + ' m²';
    };

    p.affectations.format = function(v) {
      return v.filter(function(f) {
        return f.person !== undefined;
      }).map(function(m) {
        return m.person.fullname;
      }).join(', ');
    };

    p.network.format = function(v) {
      return v.split('\r\n').join(', ');
    };

    $scope.properties = p;
    $rootScope.displayNames = p;

    $scope.updateDisplayText = function() {
      $rootScope.$emit('DisplayNames.Update', $scope.properties);
    };
    $scope.updateDisplayText();


  });
}(GeoP));
