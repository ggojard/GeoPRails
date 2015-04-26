// if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;
var radious = 1600,
  theta = 45,
  onMouseDownTheta = 45,
  phi = 60,
  onMouseDownPhi = 60;

var isMouseDown, ray, onMouseDownPosition, controls, projector;

// extrudeSettings = {}, controls;

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  var lookAt = new THREE.Vector3(2000, 0, 0);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(2500, 2500, 3000);

  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [65, 83, 68];
  controls.addEventListener('change', render);

  scene = new THREE.Scene();


  var light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);
  grid();

  function addShape(shape, floor) {
    var color;
    var points = shape.createPointsGeometry();
    var spacedPoints = shape.createSpacedPointsGeometry(0);
    var options = {
      amount: 200,
      curveSegments: 0,
      steps: 0,
      bevelEnabled: true,
      bevelThickness: 1
    };

    // 3d shape
    var geometry = new THREE.ExtrudeGeometry(shape, options);
    // var radius = 200;

    // var materials = [
    //   new THREE.MeshLambertMaterial({
    //     color: 0x00ff00,
    //     shading: THREE.FlatShading,
    //     vertexColors: THREE.VertexColors
    //   }),
    //   new THREE.MeshBasicMaterial({
    //     color: 0xff0000, // vectrices
    //     shading: THREE.FlatShading,
    //     wireframe: true,
    //     transparent: true
    //   })
    // ];
    // material = new THREE.MeshLambertMaterial({
    //   color: 0x00ff00,
    //   shading: THREE.FlatShading,
    //   vertexColors: THREE.VertexColors
    // });

    material = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa, // vectrices
      shading: THREE.FlatShading,
      wireframe: true,
      transparent: true,
      opacity: 0.125
    });
    // material = new THREE.MeshBasicMaterial({color:0x00ff00});

    // var group1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
    var group1 = new THREE.Mesh(geometry, material);
    group1.rotation.x = -Math.PI / 2;
    group1.position.y = (floor * 275);
    scene.add(group1);
  }

  function cubyFloor(floor) {
    $.getJSON('/floors/' + floor.id, function(f) {
      var min = {
        x: 0,
        y: 0
      };
      var max = {
        x: 0,
        y: 0
      };
      for (var i = 0; i < f.rooms.length; i++) {
        // for (var i = 0; i < 1; i++) {
        var r = f.rooms[i];
        var points = JSON.parse(r.points);
        if (points === null) {
          continue;
        }
        var roomPoints = points.map(function(p) {
          min.x = Math.min(p.x, min.x);
          min.y = Math.min(p.y, min.y);
          max.x = Math.min(p.x, max.x);
          max.y = Math.min(p.y, max.y);
          return new THREE.Vector2(p.x, -p.y);
        });
        var shape = new THREE.Shape(roomPoints);
        addShape(shape, floor.level);
      }

      var center = {
        x: max.x - min.x,
        y: max.y - min.y,
        z: 0
      };
      // camera.lookAt(center);
    });
  }

  function cubyBuilding(b) {
    // cubyFloor(b.floors[0]);
    for (var i = 0; i < b.floors.length; i++) {
      var f = b.floors[i];
      cubyFloor(f);
      // return;
    }
  }
  cubyBuilding(gon.company.buildings[1]);
  // for (var i = 0; i < gon.company.buildings.length; i++) {
  //   var b = gon.company.buildings[i];
  //   cubyBuilding(b);
  //   // return;
  // }

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(window.innerWidth, window.innerHeight);


  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '60px';
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function start() {
  $(function() {
    init();
    animate();
  });
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
}

function grid() {
  var line, geometry;

  var materialRed = new THREE.LineBasicMaterial({
    color: 0xff0000
  });
  var materialGreen = new THREE.LineBasicMaterial({
    color: 0x00ff00
  });
  var materialBlue = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });


  geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(2000, 0, 0));
  line = new THREE.Line(geometry, materialRed, THREE.LineStrip);
  scene.add(line);


  geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 1000, 0));
  line = new THREE.Line(geometry, materialGreen, THREE.LineStrip);
  scene.add(line);


  geometry = new THREE.Geometry()
  geometry.vertices.push(new THREE.Vector3(0, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 0, 1000));
  line = new THREE.Line(geometry, materialBlue, THREE.LineStrip);
  scene.add(line);

  // var line_material = new THREE.LineBasicMaterial({
  //     color: 0x303030
  //   }),
  //   geometry = new THREE.Geometry(),
  //   floor = -75,
  //   step = 25;
  // for (var i = 0; i <= 40; i++) {
  //   geometry.vertices.push(new THREE.Vector3(-500, floor, i * step - 500));
  //   geometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));
  //   geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
  //   geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));
  // }
  // var line = new THREE.Line(geometry, line_material, THREE.LinePieces);
  // scene.add(line);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
  stats.update();
}

function render() {
  var timer = Date.now() * 0.0001;
  renderer.render(scene, camera);
}
