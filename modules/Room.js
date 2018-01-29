const uuid = require('uuid/v4')
const logger = require('../utils/logger')(module)

const db = require('../models/controllers')
const audio = require('./audio')
const Player = require('./Player')
const Spectrum = require('./Spectrum')

const GAME_SPEED = 500
const COUNTDOWN_DELAY = 4000
const BAR_THRESHOLD_RIGHT = 10
const BAR_THRESHOLD_LEFT = 10

module.exports = class Room {
  constructor (_difficulty, _mode) {
    this.id = uuid()
    this.isGameStarted = false
    this.roomManager = require('./RoomManager').getInstance()
    this.players = {}
    this.loopTimer = null
    this.countdownTimeout = null
    this.spectrum = new Spectrum()
    this.difficulty = _difficulty
    this.mode = _mode
    this.currentBar = 0
    this._energy = 100
    this.audioStream = null
  }

  destroy () {
    logger.info(`Room ${this.id} - Destroyed`)

    this.roomManager.deleteRoom(this)
  }

  canBeJoined () {
    let canBeJoined = true

    if (this.mode === 'coop') {
      if (Object.keys(this.players).length >= 2) {
        canBeJoined = false
      }
    } else if (this.mode === 'solo') {
      if (Object.keys(this.players).length >= 1) {
        canBeJoined = false
      }
    }

    return canBeJoined
  }

  isReadyToStart () {
    let isReadyToStart = true

    if (this.mode === 'coop') {
      if (Object.keys(this.players).length !== 2) {
        isReadyToStart = false
      }
    } else if (this.mode === 'solo') {
      if (Object.keys(this.players).length !== 1) {
        isReadyToStart = false
      }
    }

    return isReadyToStart
  }

  startGame () {
    if (!this.isReadyToStart()) {
      return
    }

    let self = this

    // triggerCountdown
    for (let player in self.players) {
      this.players[player].socket.emit('countDown', {
        duration: 3
      })
    }

    let sound = this.spectrum.link
    let getStream = audio.getYoutubeStream

    // May not be the best way to check if the track is local or not
    if (sound === null) {
      getStream = audio.getLocalStream
      sound = this.spectrum.name
    }

    getStream({
      videoId: sound,
      fileName: sound
    }, (err, command) => {
      if (err) {
        logger.error(`Could not retrieve stream for sound: ${sound}`)

        return
      }

      self.audioStream = command.pipe()

      self.audioStream.on('end', () => {
        for (let player in self.players) {
          self.players[player].socket.emit('audioEnd')
        }
      })

      self.audioStream.on('data', (chunk) => {
        for (let player in self.players) {
          self.players[player].socket.emit('audioChunk', {
            chunk: chunk
          })
        }
      })

      self.audioStream.on('error', (message) => {
        logger.error('The audio stream was stopped unexpectedly')
      })
    })

    logger.info(`Starting game on room ${this.id}`)

    // Notify all players that the game has started
    for (var playerId in this.players) {
      this.players[playerId].socket.emit('gameStarted')
    }

    this.currentBar = -1

    this.countdownTimeout = setTimeout(() => {
      this.isGameStarted = true

      this.loopTimer = setInterval(() => {
        logger.debug(`Loop - currentBar ${this.currentBar} - ${this.spectrum.bars.length} - energy ${this.energy}`)

        this.currentBar += 1

        if (this.players.length === 0) {
          this.stop()
        }

        this.loseEnergy()

        if (this.energy <= 0) {
          this.lose()
        } else {
          for (let key in this.players) {
            const player = this.players[key]
            let data

            if (player.position.x > this.currentBar + BAR_THRESHOLD_RIGHT || player.position.x < this.currentBar - BAR_THRESHOLD_LEFT) {
              this.lose()
            }

            logger.debug(`Player ${player.number} - position : { x: ${player.position.x}, y: ${player.position.y}`)

            data = this.takeArtefact(player)
            for (let playerId in this.players) {
              this.players[playerId].socket.emit('updateGame', data)
            }
          }
        }
      }, GAME_SPEED)
    }, COUNTDOWN_DELAY)
  }

  addPlayer (clientSocket) {
    logger.info(`Room ${this.id} - New player ${clientSocket.id}`)

    let playerNumber = 0

    for (let player in this.players) {
      if (playerNumber !== player.number) {
        break
      } else {
        playerNumber += 1
      }
    }

    this.players[clientSocket.id] = new Player(clientSocket, playerNumber, {
      x: 0,
      y: playerNumber
    }, clientSocket.request.user)

    this.bindPlayerEvents(this.players[clientSocket.id])

    clientSocket.emit('roomJoined', {
      roomId: this.id,
      gameMetadata: this.getMetaData(this.players[clientSocket.id])
    })

    for (var playerId in this.players) {
      if (playerId !== clientSocket.id) {
        this.players[playerId].socket.emit('newPlayer', this.players[clientSocket.id].metadata)
      }
    }
  }

  bindPlayerEvents (player) {
    const self = this

    player.socket.on('startGame', () => self.startGame())

    player.socket.on('playerMove', (data) => {
      let canMove = true
      for (let playerId in self.players) {
        if (self.players[playerId].position.x === data.x && self.players[playerId].position.y === data.y) {
          // This means there is already someone at this position
          canMove = false
        }
      }

      if (canMove && self.isGameStarted) {
        player.position = {
          x: data.x,
          y: data.y
        }

        if (player.position.x < self.getLeftBoundary() || player.position.x >= self.getRightBoundary()) {
          // GameOver unicorn touch the left side
          self.lose()
        } else {
          for (let playerId in self.players) {
            self.players[playerId].socket.emit('playerMove', { number: player.number, ...player.position })
          }

          // Check is we are still playing and if the loop has started
          if (self.currentBar < self.spectrum.bars.length + BAR_THRESHOLD_LEFT && self.loopTimer && self.currentBar >= 0) {
            const checkData = self.takeArtefact(player)

            for (var playerId in self.players) {
              self.players[playerId].socket.emit('updateGame', checkData)
            }

            if (this.areAllArtefactsTaken()) {
              this.win()
            }
          }
        }
      }
    })

    player.socket.on('playAgain', () => self.resetGame())

    player.socket.on('disconnect', () => {
      self.onPlayerDisconnect(player.socket)
    })
  }

  getLeftBoundary () {
    return this.currentBar - BAR_THRESHOLD_LEFT > 0 ? this.currentBar - BAR_THRESHOLD_LEFT : 0
  }

  getRightBoundary () {
    return this.currentBar + BAR_THRESHOLD_RIGHT < this.spectrum.bars.length ? this.currentBar + BAR_THRESHOLD_RIGHT : this.spectrum.bars.length
  }

  stop () {
    logger.info(`Room ${this.id} - Stopping game`)

    if (this.audioStream) {
      this.audioStream.pause()
      this.audioStream.unpipe()
    }

    if (this.loopTimer) {
      clearInterval(this.loopTimer)
    }

    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout)
    }
  }

  onPlayerDisconnect (socket) {
    logger.info(`Room ${this.id} - Client ${socket.id} is disconnected`)

    const playerName = this.players[socket.id].name

    delete this.players[socket.id]

    this.stop()

    if (Object.keys(this.players).length === 0) {
      this.destroy()
    } else {
      for (var playerId in this.players) {
        this.players[playerId].socket.emit('playerDisconnected', playerName)
      }
    }
  }

  win () {
    logger.info(`Game in room ${this.id} is won`)

    // Stop the game loop
    this.stop()

    for (let playerId in this.players) {
      let player = this.players[playerId]

      player.socket.emit('gameOver', {
        'win': true,
        'score': this.takenArtefactsCount,
        'max': this.energy
      })

      // This is, for now, done sytematically. It might be better to ask the user before adding the score
      this.addScore(player)
    }
  }

  lose () {
    logger.info(`Game in room ${this.id} is lost`)

    // Stop the game loop
    this.stop()

    for (let playerId in this.players) {
      let player = this.players[playerId]

      player.socket.emit('gameOver', {
        'win': true,
        'score': this.takenArtefactsCount,
        'max': this.energy
      })

      // This is, for now, done sytematically. It might be better to ask the user before adding the score
      this.addScore(player)
    }
  }

  addScore (player) {
    if (player.user) {
      let coop = 1

      if (this.mode === 'solo') {
        coop = 0
      }

      const score = {
        duration: this.takenArtefactsCount,
        user_id: player.user.id,
        track_id: this.spectrum.id,
        difficulty: this.difficulty,
        coop: coop
      }

      db.user.bestScores(player.user.id, this.spectrum.id, coop, (err, bestScores) => {
        if (err) logger.error(err)

        if (bestScores.length !== 0) {
          if (bestScores[0].duration < player.takenArtefactsCount) {
            db.score.create(score, (err, res) => {
              if (err) logger.error(err)
            })
          }
        } else {
          db.score.create(score, (err, res) => {
            if (err) logger.error(err)
          })
        }
      })
    }
  }

  areAllArtefactsTaken () {
    let areAllArtefactsTaken = true

    for (let key in this.players) {
      const player = this.players[key]
      console.log(`${player.takenArtefactsCount} / ${this.spectrum.artefactsToTakeCount}`)

      areAllArtefactsTaken = areAllArtefactsTaken && (player.takenArtefactsCount === this.spectrum.artefactsToTakeCount)
    }

    return areAllArtefactsTaken
  }

  takeArtefact (player) {
    let artefactTaken = false
    let barNumber = player.position.x

    if (!player.artefactsTaken[barNumber] && barNumber >= 0) {
      artefactTaken = this.spectrum.checkArtefacts(barNumber, player)

      if (artefactTaken !== null) {
        player.artefactsTaken[barNumber] = artefactTaken

        if (artefactTaken) {
          player.takenArtefactsCount += 1
          this.gainEnergy()
        }
      }
    }

    return {
      bar: barNumber,
      takenArtefactsCount: this.takenArtefactsCount,
      energy: this.energy,
      isArtefactTaken: artefactTaken,
      y: player.position.y, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      x: player.position.x, // bar number
      playerNumber: player.number
    }
  }

  loseEnergy () {
    switch (this.difficulty) {
      case 'crazy':
        this.energy = this.energy - 2
        break
      case 'easy':
        this.energy = this.energy - 1
        break
      case 'lazy':
        // Do stuff
        break
      default:
        logger.error('Check the difficulty or the current bar something is going wrong')
    }
  }

  gainEnergy () {
    switch (this.difficulty) {
      case 'crazy':
        this.energy = this._energy + 1
        break
      case 'easy':
        // No energy change
        break
      case 'lazy':
        // No energy change
        break
      default:
        logger.error('Check the difficulty or the current bar something is going wrong')
    }
  }

  getMetaData (player) {
    let players = Object.keys(this.players).map(idx => this.players[idx].metadata)

    return {
      id: this.id,
      position: player.position,
      playerNumber: player.number,
      currentBar: 0, // TO BE DELETED
      difficulty: this.difficulty, // difficulty of the level
      mode: this.mode, // mode of the game (solo or coop)
      spectrum: this.spectrum,
      artefacts: this.artefacts,
      energy: this.energy, // duration of the music
      players: players
    }
  }

  set energy (energy) {
    this._energy = energy
  }

  get energy () {
    return this._energy > 0 ? this._energy : 0
  }

  get metadata () {
    return {
      id: this.id,
      difficulty: this.difficulty, // difficulty of the level
      mode: this.mode, // mode of the game (solo or coop)
      spectrum: this.spectrum,
      energy: this.energy // duration of the music
    }
  }

  resetGame () {
    logger.info('Game reset : ' + this.id)

    this.stop()

    this.isGameStarted = false
    this.loopTimer = null
    this.currentBar = 0
    this.audioStream = null
    let energy = 0
    this.spectrum.bars.forEach(bar => {
      if (bar.artefacts[0] !== null && bar.artefacts[1] !== null) {
        energy++

        if (this.mode === 'coop') {
          energy++
        }
      }
    })
    this.energy = energy

    // Reset players
    for (let playerId in this.players) {
      this.players[playerId].takenArtefactsCount = 0
      this.players[playerId].artefactsTaken = []

      this.players[playerId].socket.emit('roomJoined', {
        roomId: this.id,
        gameMetadata: this.getMetaData(this.players[playerId])
      })
    }
  }

  get takenArtefactsCount () {
    let takenArtefactsCount = 0

    for (let player in this.players) {
      takenArtefactsCount += this.players[player].takenArtefactsCount
    }

    return takenArtefactsCount
  }
}
