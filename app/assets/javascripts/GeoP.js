var GeoP = {};

GeoP.currentEvent = null;

GeoP.Colors = {};
GeoP.Colors.Selected = 'red';
GeoP.Colors.NotSelected = 'blue';
GeoP.Colors.Drawing = 'green';

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
    if (child[prop] === void 0) {
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
    return a & a
  }, 0);
}