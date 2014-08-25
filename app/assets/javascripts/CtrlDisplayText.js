/*global GeoP:true, gon:true*/
(function(geoP) {
  'use strict';
  geoP.app.controller('DisplayTextCtrl', function($scope, $rootScope) {

    function getDisplayNameFilter(name, value, format) {
      if (value === undefined) {
        value = false;
      }
      var res = {
        name: name,
        label: gon.i18n.room[name],
        value: value,
        format: function(v) {
          return [v];
        }
      };
      if (format !== undefined) {
        res.format = format;
      }
      return res;
    }

    var p = [];
    p.push(getDisplayNameFilter('name', true));
    p.push(getDisplayNameFilter('area', true, function(v) {
      return [v + ' m²'];
    }));
    p.push(getDisplayNameFilter('network', false, function(v) {
      return v.split('\r\n');//.join(', ');
    }));
    p.push(getDisplayNameFilter('affectations', false, function(v) {
      return v.filter(function(f) {
        return f.person !== undefined;
      }).map(function(m) {
        return m.person.fullname;
      });//.join(', ');
    }));

    $scope.updateDisplayText = function() {
      $rootScope.$emit('DisplayNames.Update', $scope.properties);
    };


    $scope.properties = p;
    $rootScope.displayNames = p;

    $scope.dragControlListeners = {
      //sourceItemHandleScope, destSortableScope
      accept: function() {
        return true;
      }, //override to determine drag is allowed or not. default is true.
      //event
      itemMoved: function() {},
      orderChanged: function(event) {
        console.log(event, p);
        $scope.updateDisplayText();
      },
      containment: '#display-text-content' //optional param.
    };

    $scope.updateDisplayText();


  });
}(GeoP));
