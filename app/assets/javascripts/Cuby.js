// if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;
var group;
var radious = 1600,
  theta = 45,
  onMouseDownTheta = 45,
  phi = 60,
  onMouseDownPhi = 60;

var isMouseDown, ray, onMouseDownPosition;
var extrudeSettings = {
  amount: 8,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 2,
  bevelSize: 1,
  bevelThickness: 1
};



function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  // var initDistance = 1200;
  camera.position.x = 800;
  camera.position.y = 800;
  camera.position.z = 1600;

  scene = new THREE.Scene();

  onMouseDownPosition = new THREE.Vector2();
  var projector = new THREE.Projector();
  ray = new THREE.Ray(camera.position, null);

  var light, object;

  scene.add(new THREE.AmbientLight(0x404040));

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 1, 0);
  scene.add(light);

  var map = THREE.ImageUtils.loadTexture('/assets/UV_Grid_Sm.jpg');
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;

  var material = new THREE.MeshLambertMaterial({
    // map: map,
    side: THREE.DoubleSide,
    color: 0xff0000
  });


  group = new THREE.Group();
  group.position.y = 0;
  scene.add(group);

  //

  // object = new THREE.Mesh(new THREE.SphereGeometry(75, 20, 10), material);
  // object.position.set(-400, 0, 200);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 1), material);
  // object.position.set(-200, 0, 200);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.OctahedronGeometry(75, 2), material);
  // object.position.set(0, 0, 200);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.TetrahedronGeometry(75, 0), material);
  // object.position.set(200, 0, 200);
  // scene.add(object);

  //

  // object = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 4, 4), material);
  // object.position.set(-400, 0, 0);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100, 4, 4, 4), material);
  // object.position.set(-200, 0, 0);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.CircleGeometry(50, 20, 0, Math.PI * 2), material);
  // object.position.set(0, 0, 0);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.RingGeometry(10, 50, 20, 5, 0, Math.PI * 2), material);
  // object.position.set(200, 0, 0);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.CylinderGeometry(25, 75, 100, 40, 5), material);
  // object.position.set(400, 0, 0);
  // scene.add(object);
  //

  // var points = [];

  // for (var i = 0; i < 50; i++) {

  //   points.push(new THREE.Vector3(Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50, 0, (i - 5) * 2));

  // }

  // object = new THREE.Mesh(new THREE.LatheGeometry(points, 20), material);
  // object.position.set(-400, 0, -200);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.TorusGeometry(50, 20, 20, 20), material);
  // object.position.set(-200, 0, -200);
  // scene.add(object);

  // object = new THREE.Mesh(new THREE.TorusKnotGeometry(50, 10, 50, 20), material);
  // object.position.set(0, 0, -200);
  // scene.add(object);

  // object = new THREE.AxisHelper(50);
  // object.position.set(200, 0, -200);
  // scene.add(object);

  // object = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 50);
  // object.position.set(400, 0, -200);
  // scene.add(object);

  //

  function addShape(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {

    var points = shape.createPointsGeometry();
    var spacedPoints = shape.createSpacedPointsGeometry(50);

    // flat shape

    // var geometry = new THREE.ShapeGeometry(shape);

    // var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    //   color: color,
    //   side: THREE.DoubleSide
    // }));
    // mesh.position.set(x, y, z - 125);
    // mesh.rotation.set(rx, ry, rz);
    // mesh.scale.set(s, s, s);
    // group.add(mesh);

    // 3d shape

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      color: color
    }));
    mesh.position.set(x, y, z - 75);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    group.add(mesh);

    // // solid line

    // var line = new THREE.Line(points, new THREE.LineBasicMaterial({
    //   color: color,
    //   linewidth: 3
    // }));
    // line.position.set(x, y, z - 25);
    // line.rotation.set(rx, ry, rz);
    // line.scale.set(s, s, s);
    // group.add(line);

    // vertices from real points

    // var pgeo = points.clone();
    // var particles = new THREE.PointCloud(pgeo, new THREE.PointCloudMaterial({
    //   color: color,
    //   size: 4
    // }));
    // particles.position.set(x, y, z + 25);
    // particles.rotation.set(rx, ry, rz);
    // particles.scale.set(s, s, s);
    // group.add(particles);

    // line from equidistance sampled points

    //   var line = new THREE.Line(spacedPoints, new THREE.LineBasicMaterial({
    //     color: color,
    //     linewidth: 3
    //   }));
    //   line.position.set(x, y, z + 75);
    //   line.rotation.set(rx, ry, rz);
    //   line.scale.set(s, s, s);
    //   group.add(line);

    //   // equidistance sampled points

    //   var pgeo = spacedPoints.clone();
    //   var particles2 = new THREE.PointCloud(pgeo, new THREE.PointCloudMaterial({
    //     color: color,
    //     size: 4
    //   }));
    //   particles2.position.set(x, y, z + 125);
    //   particles2.rotation.set(rx, ry, rz);
    //   particles2.scale.set(s, s, s);
    //   group.add(particles2);

  }



  function cubyFloor(floor) {


    $.getJSON('/floors/' + floor.id, function(f) {
      for (var i = 0; i < f.rooms.length; i++) {
        var r = f.rooms[i];
        var points = JSON.parse(r.points);
        if (points === null) {
          continue;
        }
        var roomPoints = points.map(function(p) {
          return new THREE.Vector2(p.x, p.y);
        });
        // for (var i = 0; i < roomPoints.length; i++) roomPoints[i].multiplyScalar(0.25);
        var shape = new THREE.Shape(roomPoints);
        addShape(shape, extrudeSettings, 0xf08000, 0, 0, 0, 0, 0, 0, 1);
      }
    });



  }

  function cubyBuilding(b) {
    for (var i = 0; i < b.floors.length; i++) {
      var f = b.floors[i];
      cubyFloor(f);
      return;
    }
  }

  // console.log(gon);
  for (var i = 0; i < gon.company.buildings.length; i++) {
    var b = gon.company.buildings[i];
    cubyBuilding(b);
  }


  function onDocumentMouseDown(event) {

    event.preventDefault();

    isMouseDown = true;

    onMouseDownTheta = theta;
    onMouseDownPhi = phi;
    onMouseDownPosition.x = event.clientX;
    onMouseDownPosition.y = event.clientY;

  }


  function onDocumentMouseUp(event) {

    event.preventDefault();

    isMouseDown = false;

    onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
    onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;

    if (onMouseDownPosition.length() > 5) {

      return;

    }
  }

  function onDocumentMouseMove(event) {

    event.preventDefault();

    if (isMouseDown) {

      theta = -((event.clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta;
      phi = ((event.clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;

      phi = Math.min(180, Math.max(0, phi));

      camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
      camera.position.y = radious * Math.sin(phi * Math.PI / 360);
      camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
      camera.updateMatrix();

    }

    var mouse3D = projector.unprojectVector(
      new THREE.Vector3(
        (event.clientX / renderer.domElement.width) * 2 - 1, -(event.clientY / renderer.domElement.height) * 2 + 1,
        0.5
      ),
      camera
    );
    if (mouse3D) {
      ray.direction = mouse3D.subSelf(camera.position).normalize();
    }

  }



  // document.addEventListener('mousemove', onDocumentMouseMove, false);
  // document.addEventListener('mousedown', onDocumentMouseDown, false);
  // document.addEventListener('mouseup', onDocumentMouseUp, false);


  // California

  // var californiaPts = [];

  // californiaPts.push(new THREE.Vector2(610, 320));
  // californiaPts.push(new THREE.Vector2(450, 300));
  // californiaPts.push(new THREE.Vector2(392, 392));
  // californiaPts.push(new THREE.Vector2(266, 438));
  // californiaPts.push(new THREE.Vector2(190, 570));
  // californiaPts.push(new THREE.Vector2(190, 600));
  // californiaPts.push(new THREE.Vector2(160, 620));
  // californiaPts.push(new THREE.Vector2(160, 650));
  // californiaPts.push(new THREE.Vector2(180, 640));
  // californiaPts.push(new THREE.Vector2(165, 680));
  // californiaPts.push(new THREE.Vector2(150, 670));
  // californiaPts.push(new THREE.Vector2(90, 737));
  // californiaPts.push(new THREE.Vector2(80, 795));
  // californiaPts.push(new THREE.Vector2(50, 835));
  // californiaPts.push(new THREE.Vector2(64, 870));
  // californiaPts.push(new THREE.Vector2(60, 945));
  // californiaPts.push(new THREE.Vector2(300, 945));
  // californiaPts.push(new THREE.Vector2(300, 743));
  // californiaPts.push(new THREE.Vector2(600, 473));
  // californiaPts.push(new THREE.Vector2(626, 425));
  // californiaPts.push(new THREE.Vector2(600, 370));
  // californiaPts.push(new THREE.Vector2(610, 320));

  // for (var i = 0; i < californiaPts.length; i++) californiaPts[i].multiplyScalar(0.25);

  // var californiaShape = new THREE.Shape(californiaPts);

  // addShape(californiaShape, extrudeSettings, 0xf08000, -300, -100, 0, 0, 0, 0, 1);

  // scene.add(shape);

  // var points = shape.createPointsGeometry();


  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  // stats = new Stats();
  // stats.domElement.style.position = 'absolute';
  // stats.domElement.style.top = '0px';
  // container.appendChild(stats.domElement);

  //

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

}

//

function animate() {

  requestAnimationFrame(animate);

  render();
  // stats.update();

}

function render() {

  var timer = Date.now() * 0.0001;

  // camera.position.x = Math.cos(timer) * 800;
  // camera.position.z = Math.sin(timer) * 800;

  // camera.lookAt(scene.position);

  // for (var i = 0, l = scene.children.length; i < l; i++) {

  //   var object = scene.children[i];

  //   object.rotation.x = timer * 5;
  //   object.rotation.y = timer * 2.5;

  // }

  renderer.render(scene, camera);

}
