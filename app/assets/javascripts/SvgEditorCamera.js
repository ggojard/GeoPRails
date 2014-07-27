(function(geoP) {

  var SvgEditor = geoP.SvgEditor;


  geoP.DefaultCamera = {
    scale: 1,
    x: 0,
    y: 0
  };;


  function registerCamera(floorId, camera) {
    if (localStorage) {
      localStorage['floor-' + floorId + '-camera'] = JSON.stringify(camera);
    }
  }

  function loadCamera(floorId) {
    if (localStorage) {
      var c = localStorage['floor-' + floorId + '-camera'];
      if (c !== void 0) {
        return JSON.parse(c);
      }
    }
    return {
      scale: geoP.DefaultCamera.scale,
      x: geoP.DefaultCamera.x,
      y: geoP.DefaultCamera.y
    };
  }

  SvgEditor.prototype.loadCamera = function() {
    this.camera = loadCamera(this.json.id);
  };

  SvgEditor.prototype.applyTransform = function() {
    var x = 1 / this.camera.scale * this.camera.x;
    var y = 1 / this.camera.scale * this.camera.y;
    this.canvas.transform(["scale(", this.camera.scale, ") translate(", x, ' ', y, ')'].join(''));
    registerCamera(this.json.id, this.camera);
  };



}(GeoP));