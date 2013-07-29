var engine = require('voxel-engine');
var player = require('voxel-player');
var fly = require('voxel-fly');
var extend = require('extend');
var TWEEN = require('./tween');

// week space
var zS = 2 * 12 + 35;
// day space
var xD = 31 + 5;
// side space
var zZ = -15;

var slides;
var wsServer = 'ws://' + 'localhost:8081';

module.exports = function(opts, setup) {
  setup = setup || defaultSetup;
  var defaults = {
    generate: function (x, y, z) {
      //walls
      /*
      if ((x === -10 || x === xD) && y > -4 && y < 120 && z >= zZ && z < zS) {
        return 1;
      }

      if ((z === zZ || z === zS) && y > -4 && y < 120 && x >= -10 && x < xD) {
        return 1;
      }
        */

      if (y === 25) {
        return 1;
      }

      if ( y > -2 && y <= 26 ) {
        return y <= (x*x + z * z) * 31 / (32 * 32 * 2) + 1 ? 1 : 0;
      }
    },
    chunkDistance: 2,
    materials: ['#fff', '#000'],
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true }
  };
  opts = extend({}, defaults, opts || {});

  // setup the game and add some trees
  var game = engine(opts);
  var container = opts.container || document.body;
  window.game = game; // for debugging
  game.appendTo(container);
  if (game.notCapable()) return game

  var createPlayer = player(game);

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var avatar = createPlayer(opts.playerSkin || 'player.png');
  avatar.possess();
  avatar.yaw.position.set(0, 15, 15);

  setup(game, avatar);
  // TODO
  slides = require('./slides')(game);

  return game
};

function defaultSetup(game, avatar) {
  var TABKEY = 9;
  var ENTERKEY = 13;

  var makeFly = fly(game);
  var target = game.controls.target();

  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === TABKEY) {
      slides.prev();
    }
    else if (ev.keyCode === ENTERKEY) {
      slides.next();
    }
  });

  game.flyer = makeFly(target);

  game.on('tick', function() {
    TWEEN.update();
  })
}


