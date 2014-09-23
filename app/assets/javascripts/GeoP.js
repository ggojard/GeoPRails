var GeoP = {};



/*global GeoP:true, jQuery:true*/
(function(geoP, $) {
  'use strict';

  geoP.currentEvent = null;

  geoP.Colors = {};
  geoP.Colors.NotSelected = '#0b6aff';
  geoP.Colors.Drawing = '#00e567';

  geoP.extend = function(Parent, child) {
    var p, prop, value;

    function construct(constructor, args) {
      function F() {
        return constructor.apply(this, args);
      }
      F.prototype = constructor.prototype;
      return new F();
    }
    p = construct(Parent, Array.prototype.slice.call(arguments, 2));
    child.base = {};
    for (prop in p) {
      // if (p.hasOwnProperty(prop)) {
      if (child[prop] === undefined) {
        value = p[prop];
        child[prop] = value;
      } else {
        child.base[prop] = Parent.prototype[prop];
      }
      // }
    }
  };


  geoP.$apply = function($scope) {
    setTimeout(function() {
      $scope.$apply();
    });
  };

  geoP.getRoomIdFromHash = function() {
    var hash, res;
    hash = window.location.hash;
    if (hash.length > 0) {
      res = hash.replace('#', '');
      return parseInt(res, 10);
    }

  };

  geoP.hashCode = function(s) {
    /*jslint bitwise: true*/
    return s.split('').reduce(function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  };

  geoP.filtersNames = [{
    name: 'room_type',
    label: 'Typologie des pièces'
  }, {
    name: 'organization',
    label: 'Organisations'
  }, {
    name: 'room_ground_type',
    label: 'Nature des sols'
  }, {
    name: 'evacuation_zone',
    label: "Zones d'évacuations"
  }];


  $(function() {
    setTimeout(function() {
      $('.nav.nav-pills a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
      });
    }, 1000);
  });

}(GeoP, jQuery));
