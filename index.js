var url = require('url')
var websocket = require('websocket-stream')
var engine = require('voxel-engine')
var walk = require('voxel-walk')
var duplexEmitter = require('duplex-emitter')
var randomName = require('./www/randomname')
var crunch = require('voxel-crunch')
var highlight = require('voxel-highlight')
var skin = require('minecraft-skin')
var player = require('voxel-player')
var texturePath = "/textures/"

module.exports = Client

function Client(server, game) {
  if(!(this instanceof Client)) {
    return new Client(server, game)
  }
  this.playerID
  window.connectedClient = this
  this.lastProcessedSeq = 0
  this.localInputs = []
  this.connected = false
  this.currentMaterial = 1
  this.lerpPercent = 0.1
  this.server = server || 'ws://' + url.parse(window.location.href).host
  this.others = {}
  this.connect(server, game)
  this.game
  window.others = this.others
}

Client.prototype.connect = function(server, game) {
  var self = this
  var socket = websocket(server)
  socket.on('end', function() { self.connected = false })
  this.socket = socket
  this.bindEvents(socket, game)
}

Client.prototype.bindEvents = function(socket, game) {
  var self = this
  this.emitter = duplexEmitter(socket)
  var emitter = this.emitter
  this.connected = true

  emitter.on('id', function(id) {
    console.log('got id', id)
    self.playerID = id
    if (game != null) {
      self.game = game
      console.log("Sending local settings to the server.")
      emitter.emit('clientSettings', self.game.settings)
    } else {
      emitter.emit('clientSettings', null)
    }
  })


  emitter.on('settings', function(settings) {
    settings.texturePath = texturePath
    settings.generateChunks = false
  //deserialise the voxel.generator function.
  if (settings.generatorToString != null) {
    settings.generate = eval("(" + settings.generatorToString + ")")
  }
    self.game = self.createGame(settings, game)  
  emitter.emit('created')
    emitter.on('chunk', function(encoded, chunk) {
      var voxels = crunch.decode(encoded, chunk.length)
      chunk.voxels = voxels
      self.game.showChunk(chunk)
    })
  })

  // fires when server sends us voxel edits
  emitter.on('set', function(pos, val) {
    self.game.setBlock(pos, val)
  })
}

Client.prototype.createGame = function(settings, game) {
  var self = this
  var emitter = this.emitter
  settings.controlsDisabled = false
  self.game = engine(settings)
  self.game.settings = settings
  function sendState() {
    if (!self.connected) return
    var player = self.game.controls.target()
    var state = {
      position: player.yaw.position,
      rotation: {
        y: player.yaw.rotation.y,
        x: player.pitch.rotation.x
      }
    }
    emitter.emit('state', state)
  }
  
  var name = localStorage.getItem('name')
  if (!name) {
    name = randomName()
    localStorage.setItem('name', name)
  }

  self.game.controls.on('data', function(state) {
    var interacting = false
    Object.keys(state).map(function(control) {
      if (state[control] > 0) interacting = true
    })
    if (interacting) sendState()
  })
    

  // setTimeout is because three.js seems to throw errors if you add stuff too soon
  setTimeout(function() {
    emitter.on('update', function(updates) {
      if (window.slides && updates.currentSlide !== window.currentSlide && window.takeControl !== true) {
        window.slides.setCurrent(updates.currentSlide, 'static');
      }
      Object.keys(updates.positions).map(function(player) {
        var update = updates.positions[player]
        if (player === self.playerID) return self.onServerUpdate(update) // local player
        self.updatePlayerPosition(player, update) // other players
      })
    })
  }, 1000)

  emitter.on('leave', function(id) {
    if (!self.others[id]) return
    self.game.scene.remove(self.others[id].mesh)
    delete self.others[id]
  })
  
  return self.game
}

Client.prototype.onServerUpdate = function(update) {
  // todo use server sent location
}

Client.prototype.lerpMe = function(position) {
  var to = new this.game.THREE.Vector3()
  to.copy(position)
  var from = this.game.controls.target().yaw.position
  from.copy(from.lerp(to, this.lerpPercent))  
}

Client.prototype.updatePlayerPosition = function(id, update) {
  var pos = update.position
  var player = this.others[id]
  if (!player) {
    var playerSkin = skin(this.game.THREE, 'player2.png', {
      scale: new this.game.THREE.Vector3(0.04, 0.04, 0.04)
    })
    var playerMesh = playerSkin.mesh
    playerSkin.lastPos = pos;
    this.others[id] = playerSkin
    playerMesh.children[0].position.y = 10
    this.game.scene.add(playerMesh)
  }
  var playerSkin = this.others[id]
  var playerMesh = playerSkin.mesh
  playerMesh.position.copy(playerMesh.position.lerp(pos, this.lerpPercent))
  var walkSpeed = 1.0
  var time = Date.now() / 1000
  if (playerSkin.lastPos.x !== pos.x || playerSkin.lastPos.y !== pos.y  || playerSkin.lastPos.z !== pos.z) {
    playerSkin.head.rotation.y = Math.sin(time * 1.5) / 3 * walkSpeed
    playerSkin.head.rotation.z = Math.sin(time) / 2 * walkSpeed

    playerSkin.rightArm.rotation.z = 2 * Math.cos(0.6662 * time * 10 + Math.PI) * walkSpeed
    playerSkin.rightArm.rotation.x = 1 * (Math.cos(0.2812 * time * 10) - 1) * walkSpeed
    playerSkin.leftArm.rotation.z = 2 * Math.cos(0.6662 * time * 10) * walkSpeed
    playerSkin.leftArm.rotation.x = 1 * (Math.cos(0.2312 * time * 10) + 1) * walkSpeed

    playerSkin.rightLeg.rotation.z = 1.4 * Math.cos(0.6662 * time * 10) * walkSpeed
    playerSkin.leftLeg.rotation.z = 1.4 * Math.cos(0.6662 * time * 10 + Math.PI) * walkSpeed
    playerSkin.lastPos = pos;
  } else {
    playerSkin.rightArm.rotation.z = 0
    playerSkin.rightArm.rotation.x = 0
    playerSkin.leftArm.rotation.z = 0
    playerSkin.leftArm.rotation.x = 0
    playerSkin.rightLeg.rotation.z = 0
    playerSkin.leftLeg.rotation.z = 0
  }
  window.playerSkin = playerSkin
  // playerMesh.position.y += 17
  playerMesh.children[0].rotation.y = update.rotation.y + (Math.PI / 2)
  playerSkin.head.rotation.z = scale(update.rotation.x, -1.5, 1.5, -0.75, 0.75)
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
