define([], function() {

  function Slides(options) {
    if (!options) options = {};
    if (!(this instanceof Slides)) return new Slides(game, options);

    this.group = new THREE.Object3D();
    this.group.position.set(0, 0, 0);

    this.scene = options.scene;
    this.scene.add(this.group);
    this.createSliderExtras();
    this.load();
    this.render();
    this.setupControls();

    this.current = 0;
  }

  Slides.prototype.load = function (data) {
    data = [];

    for (var n = 1; n <= 3; n++) {
      //if (n < 10) n = "0" + n;

      data.push( { src: '/slides/' + n + '.jpg' } );
    }

    this.slideData = data;
  };


  Slides.prototype.render = function () {
    var self = this;

    this.slides = [];

    this.slideData.forEach(function (slide, i) {
      var image = new Image();

      image.addEventListener('load', function () {
        var texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        var geometry = new THREE.BoxGeometry(160, 120, 0.01);
        var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });

        if (i === 0) {
          material.opacity = 1;
        }

        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI;
        mesh.position.x = 0;
        mesh.position.z = -160;
        mesh.position.y = 60;


        self.slides[i] = mesh;
        self.group.add(mesh);
        console.log(mesh);

      });

      image.src = slide.src;
    });
  };

  Slides.prototype.setCurrent = function (idx) {
    console.log(idx);
    var oldSlide = this.slides[this.current];
    oldSlide.material.opacity = 0;
    console.log(oldSlide);

    this.current = idx;
    var newSlide = this.slides[this.current];
    newSlide.material.opacity = 1;
  };

  Slides.prototype.next = function () {
    this.setCurrent(this.current + 1);
  };

  Slides.prototype.prev = function () {
    this.setCurrent(this.current - 1);
  };

  Slides.prototype.createSliderExtras = function () {
    var sPos = { x: 0, y: 0, z: 0 };

    var glassMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    var geometry = new THREE.BoxGeometry(20, 5, 0.5);
    var slider = new THREE.Mesh(geometry, glassMaterial);
    this.scene.add(slider);
  };

  Slides.prototype.setupControls = function () {
    var self = this;

    window.addEventListener('keydown', function (ev) {
      var TABKEY = 9;
      var ENTERKEY = 13;
      var A = 219;
      var D = 221;

      if (ev.keyCode === TABKEY) {
        self.prev();
      }
      else if (ev.keyCode === ENTERKEY) {
        console.log('enter');
        self.next();
      }

    });
  };

  return Slides;

});
