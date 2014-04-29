define(['slides', 'utils', 'pointerlock'], function (Slides, Utils, PointerLock) {

  var utils = new Utils();
  var camera, scene, renderer;
  var mesh;
  var controls;

  var clock = new THREE.Clock();


  init();
  animate();

  function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 60;
    camera.position.z = -42;
    scene = new THREE.Scene();
    window.scene = scene;
    window.camera = camera;


    /*
     var geometry = new THREE.BoxGeometry( 200, 200, 200 );
     var material = new THREE.MeshNormalMaterial();
     mesh = new THREE.Mesh( geometry, material );
     mesh.sp = 0;
     utils.gui.add(mesh, 'sp', -5, 5);
     scene.add(mesh);
     */

    controls = new THREE.PointerLockControls(camera);
    var p = new PointerLock(controls);
    console.log(p);
    scene.add(controls.getObject());

    var slides = new Slides({
      scene: scene
    });
    slides.load(['slides/1.jpg', 'slides/2.jpg', 'slides/3.jpg']);

    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    utils.renderStart();

    var delta = clock.getDelta();

    requestAnimationFrame(animate);

    //mesh.rotation.x += 0.005 * mesh.sp;
    //mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    controls.update();
    utils.renderEnd();
  }

});