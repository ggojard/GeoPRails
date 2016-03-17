/*global GeoP, gon*/

(function(geoP) {
  'use strict';

  geoP.app.controller('HomeController', function($location) {
    $location.path('/companies/' + gon.company.id);
  });

}(GeoP));
