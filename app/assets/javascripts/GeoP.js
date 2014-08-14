var GeoP = {};

GeoP.currentEvent = null;

GeoP.Colors = {};
GeoP.Colors.Selected = '#ff9000';
GeoP.Colors.NotSelected = '#0b6aff';
GeoP.Colors.Drawing = '#00e567';

GeoP.extend = function(Parent, child) {
  function construct(constructor, args) {
    function F() {
      return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
  }
  var p = construct(Parent, Array.prototype.slice.call(arguments, 2));
  child.base = {};
  for (var prop in p) {
    if (child[prop] === undefined) {
      var value = p[prop];
      child[prop] = value;
    } else {
      child.base[prop] = Parent.prototype[prop];
    }
  }
};

GeoP.hashCode = function(s) {
  return s.split("").reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
};

GeoP.filtersNames = [{
  name: 'room_type',
  label: "Typologie des pièces"
}, {
  name: 'organization',
  label: "Organisations"
}, {
  name: 'room_ground_type',
  label: "Nature des sols"
}, {
  name: 'evacuation_zone',
  label: "Zones d'évacuations"
}];

$(function() {
  setTimeout(function() {
    $('#myTab a').click(function(e) {
      e.preventDefault();
      $(this).tab('show');
    });
  }, 1000);
});