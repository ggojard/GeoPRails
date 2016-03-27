var GeoP = {};

/*global GeoP, moment*/
(function(geoP) {
  'use strict';

  moment.locale('fr');
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
      if (child[prop] === undefined) {
        value = p[prop];
        child[prop] = value;
      } else {
        child.base[prop] = Parent.prototype[prop];
      }
    }
  };


  geoP.getMenuItem = function(id, name, templateFolder, options) {
    var res = {
      id: id,
      name: name,
      template: geoP.format('/templates/{0}/{1}.ng.html', templateFolder, id),
      shouldDisplay: function() {
        return true;
      },
      onclick: function() {
        return;
      }
    };
    if (options !== undefined) {
      if (options.shouldDisplay !== undefined) {
        res.shouldDisplay = options.shouldDisplay;
      }
      if (options.onclick !== undefined) {
        res.onclick = options.onclick;
      }
    }
    return res;
  };



  geoP.updateHashWithRoomId = function(roomId) {
    var hash, idSection;
    hash = document.location.hash;
    idSection = 'rId=' + roomId;
    if (hash.indexOf('rId') !== -1) {
      hash = hash.replace(/rId=[0-9]*/, idSection);
    } else {
      hash += '?rId=' + roomId;
    }
    document.location.hash = hash;
  };


  geoP.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function(match, number) {
      return args[number] !== undefined ? args[number] : match;
    });
  };

  geoP.displayArea = function(area) {
    if (area !== undefined) {
      return area.toFixed(2) + ' m²';
    }
    return '';
  };

  geoP.registerEditorStopLoading = function($rootScope) {
    $rootScope.$on('editor-loaded', function() {
      $rootScope.floorsToLoad -= 1;
      if ($rootScope.floorsToLoad <= 0) {
        $rootScope.$emit('stop-loading');
        $rootScope.$emit('all-editors-loaded');
      }
    });
  };

  geoP.$apply = function($scope) {
    setTimeout(function() {
      $scope.$apply();
    }, 0);
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
    name: 'direction',
    label: 'Directions'
  }, {
    name: 'organization',
    label: 'Services'
  }, {
    name: 'room_ground_type',
    label: 'Nature des sols'
  }, {
    name: 'evacuation_zone',
    label: "Zones d'évacuations"
  }];

  geoP.chartMenuItem = geoP.getMenuItem('charts', 'Rapports', 'floors', {
    onclick: function($scope, buildingId) {
      geoP.refreshCurrentChart(buildingId, $scope);
    }
  });



}(GeoP));
