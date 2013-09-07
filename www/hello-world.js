var createClient = require('../')
var highlight = require('voxel-highlight')
var extend = require('extend')
var fly = require('voxel-fly')
var voxelPlayer = require('voxel-player')
var walk = require('voxel-walk')
var TWEEN = require('./tween');
var game
var slides
var client

module.exports = function(opts, setup) {
  setup = setup || defaultSetup
  opts = extend({}, opts || {})

  client = createClient(opts.server || "ws://localhost:8095/")
  
  client.emitter.on('noMoreChunks', function(id) {
    console.log("Attaching to the container and creating player")
    var container = opts.container || document.body
    game = client.game
    game.appendTo(container)
    if (game.notCapable()) return game
    var createPlayer = voxelPlayer(game)

    // create the player from a minecraft skin file and tell the
    // game to use it as the main player
    var avatar = createPlayer('player2.png')
    window.avatar = avatar
    avatar.possess()
    var settings = game.settings.avatarInitialPosition
    avatar.position.set(settings[0],settings[1],settings[2])
    setup(game, avatar, client)

    slides = require('./slides')(game, client);
    window.slides = slides
    if (game.settings.currentSlide) {
      slides.setCurrent(game.settings.currentSlide)
    }
  })

  return game
}

function defaultSetup(game, avatar, client) {

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  var TABKEY = 9;
  var ENTERKEY = 13;
  var A = 219;
  var D = 221;
  var makeFly = fly(game);
  var target = game.controls.target();

  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === TABKEY) {
      slides.prev();
    }
    else if (ev.keyCode === ENTERKEY) {
      slides.next();
    }
    if (ev.keyCode === A) {
      slides.prev('static');
    }
    else if (ev.keyCode === D) {
      slides.next('static');
    }
  });

  game.flyer = makeFly(target);


  game.on('tick', function() {

    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()

    TWEEN.update();
  })

}