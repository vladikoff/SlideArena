var TWEEN = require('./tween');
window.TWEEN = TWEEN;
window.takeControl = false;
window.currentSlide = 0

module.exports = Slides;

function Slides(game, client, options) {
  if (!options) options = {};
  if (!(this instanceof Slides)) return new Slides(game, options);

  this.CENTER = { x: 0.5, y: 8, z: 0 };
  this.OFFSET = { x: 0.5, y: -5, z: 0 };
  this.SWITCHING = false;
  this.current = window.currentSlide;

  if (client) {
    this.client = client;
  }

  this.game = game;
  this.group = new game.THREE.Object3D();
  this.group.position.set(0, 0, 0);

  this.game.scene.add(this.group);
  this.createSliderExtras();
  this.load();
  this.render();
}

Slides.prototype.load = function (data) {
  data = [];

  for (var n = 1; n <= 27; n++) {
    if (n < 10) n = "0" + n;

    data.push( { src: '/slides/voxeljs-jquery.0' + n + '.png' } );
  }

  this.slideData = data;
};


Slides.prototype.render = function () {
  var self = this;

  this.slides = [];

  this.slideData.forEach(function (slide, i) {
    var image = new Image();

    image.addEventListener('load', function () {
      var texture = new self.game.THREE.Texture(image);
      texture.needsUpdate = true;
      var geometry = new self.game.THREE.CubeGeometry(16, 12, 0.01);
      var mesh = new self.game.THREE.Mesh(geometry, new self.game.THREE.MeshBasicMaterial({ map: texture }));

      mesh.rotation.y = Math.PI;
      mesh.position.x = self.OFFSET.x;
      mesh.position.y = self.OFFSET.y;

      self.slides[i] = mesh;
      self.group.add(mesh);

      if (self.game.settings.currentSlide === i) {
        self.setCurrent(self.game.settings.currentSlide)
      }
    });

    image.src = slide.src;
  });
};

Slides.prototype.setCurrent = function (idx, opts) {
  var self = this;
  var c = this.CENTER;
  var o = this.OFFSET;

  var transIn = 800;
  var transOut = 500;

  if (opts) {
    transIn = 0;
    transOut = 0;
  }

  if (idx >= 0 && idx < this.slides.length && !this.SWITCHING) {
    var oldSlide = this.slides[this.current];

    if (oldSlide) {
      this.SWITCHING = true;
      this.current = idx;

      var newSlide = this.slides[idx];
      if (window.connectedClient.emitter && window.takeControl) {
        console.log('Sending Slide')
        window.connectedClient.emitter.emit('slide', idx)
      }

      var exit = new TWEEN.Tween(oldSlide.position)
        .to(this.OFFSET, transIn)
        .easing(TWEEN.Easing.Back.Out)
        .start();

      var enter = new TWEEN.Tween(newSlide.position)
        .to(this.CENTER, transOut)
        .easing(TWEEN.Easing.Quadratic.Out);

      exit.onComplete(function () {
        enter.start();
      });

      enter.onComplete(function () {
        self.SWITCHING = false;
      });

      window.currentSlide = idx
      window.slide = newSlide;
      //slide.position.set(c.x, c.y, c.z);
    }
  }
};

Slides.prototype.next = function (opts) {
  this.setCurrent(this.current + 1, opts);
};

Slides.prototype.prev = function (opts) {
  this.setCurrent(this.current - 1, opts);
};

Slides.prototype.createSliderExtras = function () {
  var sPos = { x: 0, y: 0, z: 0 };

  var glassMaterial = new this.game.THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  var geometry = new this.game.THREE.CubeGeometry(20, 5, 0.5);
  var slider = new this.game.THREE.Mesh(geometry, glassMaterial);
  this.game.scene.add(slider);
};