(function() {
  'use strict';
  /*global THREE, Stats, GeoP, requestAnimationFrame*/

  var floorAmount = 200,
    floorSpace = 300,
    // canvasWidth = window.innerWidth - 350,
    Cuby;

  Cuby = function($rootScope, buildingJson) {
    this.buildingJson = buildingJson;
    this.rooms3dById = {};
    this.$rootScope = $rootScope;
    this.mapFilter = $rootScope.mapFilter[this.buildingJson.id];
    this.mapFilter.cuby = this;
    this.init();
  };

  Cuby.prototype.upateRoom3dWithFilter = function(filterName, room3d, value) {
    var item = this.mapFilter.bfilters[this.buildingJson.id].belongsToItems[filterName][value.id];
    if (item.state === true) {
      room3d.three.material = room3d.material.fill;
      room3d.three.material.color.setHex(item.color.replace('#', '0x'));
    }
  };

  Cuby.prototype.applyFilter = function(room3d, filterName) {
    var value;
    if (filterName === 'direction') {
      value = room3d.json.organization;
      // if the value got a parent
      if (value !== undefined && value.organization !== undefined) {
        value = value.organization;
        this.upateRoom3dWithFilter(filterName, room3d, value);
      }
    } else {
      value = room3d.json[filterName];
      if (value !== undefined) {
        this.upateRoom3dWithFilter(filterName, room3d, value);
      }
    }
  };

  Cuby.prototype.applyFilters = function(filterName) {
    var oId, room3d;
    for (oId in this.rooms3dById) {
      if (this.rooms3dById.hasOwnProperty(oId)) {
        room3d = this.rooms3dById[oId];
        room3d.three.material = room3d.material.vectrices;
        this.applyFilter(room3d, filterName);
      }
    }
  };

  Cuby.prototype.setupCamera = function() {
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, 10000);
    this.camera.position.set(4500, 4000, 4000);
  };

  Cuby.prototype.setupControls = function() {
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.keys = [65, 83, 68];
    this.controls.addEventListener('change', this.render.bind(this));
  };

  Cuby.prototype.setupRenderer = function() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  };

  Cuby.prototype.init = function() {
    this.container = document.getElementById('CubyWebGL');
  };

  Cuby.prototype.initDomIsReady = function() {
    this.setupCamera();
    this.setupRenderer();
    this.setupSceneAndLight();
    this.setupAxes();
    this.createBuilding(this.buildingJson);
    this.setupControls();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.animate();

  };

  Cuby.prototype.onWindowResize = function() {
    this.renderer.domElement.style.height = window.innerHeight + 'px';
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.controls.handleResize();
  };


  Cuby.prototype.setupSceneAndLight = function() {
    this.scene = new THREE.Scene();
    var light = new THREE.AmbientLight(0xffffff); // soft white light
    this.scene.add(light);
  };

  Cuby.prototype.setupStats = function() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '60px';
    this.stats.domElement.style.zIndex = 100;
    this.container.appendChild(this.stats.domElement);
  };

  Cuby.prototype.createBuilding = function(b) {
    var i, f;
    for (i = 0; i < b.floors.length; i += 1) {
      f = b.floors[i];
      this.createFloor(f);
    }
  };

  Cuby.prototype.createFloor = function(f) {
    var min, max, i, r, points, roomPoints, shape;
    min = {
      x: 0,
      y: 0
    };
    max = {
      x: 0,
      y: 0
    };

    function getVector(p) {
      min.x = Math.min(p.x, min.x);
      min.y = Math.min(p.y, min.y);
      max.x = Math.min(p.x, max.x);
      max.y = Math.min(p.y, max.y);
      return new THREE.Vector2(p.x, -p.y);
    }

    for (i = 0; i < f.rooms.length; i += 1) {
      r = f.rooms[i];
      points = JSON.parse(r.points);
      if (points !== null && points.length > 2) {
        roomPoints = points.map(getVector);
        shape = new THREE.Shape(roomPoints);
        this.addShape(shape, r, f.level);
      }
    }

    // center = {
    //   x: max.x - min.x,
    //   y: max.y - min.y,
    //   z: 0
    // };
    // camera.lookAt(center);
  };


  Cuby.prototype.addShape = function(shape, roomJson, floorLevel) {
    // var points, spacedPoints;
    var options, geometry, vectricesMaterial, fillMaterial, group1;
    // points = shape.createPointsGeometry();
    // spacedPoints = shape.createSpacedPointsGeometry(0);
    options = {
      amount: floorAmount,
      curveSegments: 0,
      steps: 0,
      bevelEnabled: true,
      bevelThickness: 1
    };

    // 3d shape
    geometry = new THREE.ExtrudeGeometry(shape, options);

    vectricesMaterial = new THREE.MeshBasicMaterial({
      color: 0xdddddd, // vectrices
      // shading: THREE.FlatShading,
      wireframe: true,
      transparent: true,
      opacity: 0.125
    });

    fillMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      // shading: THREE.FlatShading,
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: 0.75
    });
    group1 = new THREE.Mesh(geometry, vectricesMaterial);
    group1.rotation.x = -Math.PI / 2;
    group1.position.y = (floorLevel * (floorAmount + floorSpace));
    this.scene.add(group1);
    this.rooms3dById[roomJson.id] = {
      json: roomJson,
      three: group1,
      material: {
        vectrices: vectricesMaterial,
        fill: fillMaterial
      }
    };
  };


  Cuby.prototype.setupAxes = function() {
    var line, geometry, materialRed, materialGreen, materialBlue;

    materialRed = new THREE.LineBasicMaterial({
      color: 0xff0000
    });
    materialGreen = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    materialBlue = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(2000, 0, 0));
    line = new THREE.Line(geometry, materialRed, THREE.LineStrip);
    this.scene.add(line);


    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 1000, 0));
    line = new THREE.Line(geometry, materialGreen, THREE.LineStrip);
    this.scene.add(line);


    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 1000));
    line = new THREE.Line(geometry, materialBlue, THREE.LineStrip);
    this.scene.add(line);
  };

  Cuby.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.updates();
    this.render();
  };

  Cuby.prototype.updates = function() {
    if (this.controls !== undefined) {
      this.controls.update();
    }
    if (this.stats !== undefined) {
      this.stats.update();
    }
  };

  Cuby.prototype.render = function() {
    if (this.renderer !== undefined) {
      this.renderer.render(this.scene, this.camera);
    }
  };


  GeoP.Cuby = Cuby;

}());
