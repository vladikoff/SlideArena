define([], function() {

  function Utils() {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    this.stats = new Stats();

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';

    document.body.appendChild( this.stats.domElement );

    this.gui = new dat.GUI();

  }

  Utils.prototype.renderStart = function() {
    return this.stats.begin();
  };

  Utils.prototype.renderEnd = function() {
    return this.stats.end();
  };

  Utils.prototype.gui = function () {
    return this.gui;
  };


  return Utils;
});
