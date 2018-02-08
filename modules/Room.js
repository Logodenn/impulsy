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
/**
 * Room object manage the game.
 * This object exchange via websocket to the front
 * Notify Player objet for the movements
 * Notify Spectrum to check artefacts on the bars
 * @class
 */
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

  /**
   * Delete the room
   * @function
   */
  destroy () {
    logger.info(`Room ${this.id} - Destroyed`)

    this.roomManager.deleteRoom(this)
  }

  /**
   * Verification if the game is in coop or solo and check the number of player(s)
   * @function
   */
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

  /**
   * Verification if the game can start with the number of player(s)
   * @function
   */
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

  /**
   * Start the game with a countdown and the check multiple times the position of the players
   * @function
   */
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

        if (this.energy <= 0) {
          this.lose()
        } else {
          for (let key in this.players) {
            const player = this.players[key]
            let data

            if (player.position.x > this.getRightBoundary() || player.position.x < this.getLeftBoundary()) {
              this.lose()
            }

            data = this.takeArtefact(player)
            for (let playerId in this.players) {
              this.players[playerId].socket.emit('updateGame', data)
            }
          }
        }
      }, GAME_SPEED)
    }, COUNTDOWN_DELAY)
  }

  /**
   * Add a player in a room on wainting room page
   * @function
   * @param {*} clientSocket
   */
  addPlayer (clientSocket) {
    logger.info(`Room ${this.id} - New player ${clientSocket.id}`)

    let playerNumber = 0

    for (let key in this.players) {
      let player = this.players[key]

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

  /**
   * Bind informations from the webSocket
   * @function
   * @param {*} player
   */
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
            self.players[playerId].socket.emit('playerMove', {
              number: player.number,
              x: player.position.x,
              y: player.position.y
            })
          }

          // Check is we are still playing and if the loop has started
          if (self.currentBar < self.getRightBoundary() && self.loopTimer && self.currentBar >= 0) {
            let checkData

            if (player.position.x > player.maxXPosition && this.spectrum.bars[player.position.x].artefacts[0] !== null) {
              this.loseEnergy()
            }

            player.updateMaxXPosition()

            checkData = self.takeArtefact(player)

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

  /**
   * Get bar position of the left bound
   * @function
   */
  getLeftBoundary () {
    return this.currentBar - BAR_THRESHOLD_LEFT > 0 ? this.currentBar - BAR_THRESHOLD_LEFT : 0
  }

  /**
   * Get bar position of the right bound
   * @function
   */
  getRightBoundary () {
    return this.currentBar + BAR_THRESHOLD_RIGHT < this.spectrum.bars.length ? this.currentBar + BAR_THRESHOLD_RIGHT : this.spectrum.bars.length
  }

  /**
   * Stop the game if a player leave the page or at the end of game
   * @function
   */
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

  /**
   * If a player leave the page make the game in pause
   * @function
   * @param {*} socket
   */
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

  /**
   * Add score of the player(s) and notify front of the win
   * @function
   */
  win () {
    logger.info(`Game in room ${this.id} is won`)

    // Stop the game loop
    this.stop()

    for (let playerId in this.players) {
      let player = this.players[playerId]

      player.socket.emit('gameOver', {
        'win': true,
        'score': this.takenArtefactsCount,
        'max': this.spectrum.artefactsToTakeCount
      })

      // This is, for now, done sytematically. It might be better to ask the user before adding the score
      this.addScore(player)
    }
  }

  /**
   * Stop the game and notify front of the lose
   * @function
   */
  lose () {
    logger.info(`Game in room ${this.id} is lost`)

    // Stop the game loop
    this.stop()

    for (let playerId in this.players) {
      let player = this.players[playerId]

      player.socket.emit('gameOver', {
        'win': false,
        'score': this.takenArtefactsCount,
        'max': this.spectrum.artefactsToTakeCount
      })

      // This is, for now, done sytematically. It might be better to ask the user before adding the score
      this.addScore(player)
    }
  }

  /**
   * Add the score of the player
   * Check if it's the best
   * @function
   * @param {*} player
   */
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

  /**
   * check if all artefacts are taken
   * @function
   */
  areAllArtefactsTaken () {
    let areAllArtefactsTaken = true

    for (let key in this.players) {
      const player = this.players[key]

      areAllArtefactsTaken = areAllArtefactsTaken && (player.takenArtefactsCount === this.spectrum.artefactsToTakeCount)
    }

    return areAllArtefactsTaken
  }

  /**
   * Look if the player can take the artefact
   * @function
   * @param {*} player
   */
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
      takenArtefactsCount: player.takenArtefactsCount,
      energy: this.energy,
      isArtefactTaken: artefactTaken,
      y: player.position.y, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      x: player.position.x, // bar number
      playerNumber: player.number
    }
  }

  /**
   * Decrease the energy of the game
   */
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

  /**
   * Increase the energy of the game
   */
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

  /**
   * Return the metadata of the game and the player
   * @function
   * @param {*} player
   */
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

  /**
   * Set the energy of the game
   * @function
   */
  set energy (energy) {
    this._energy = energy
  }

  /**
   * Return the energy of the game
   * @function
   */
  get energy () {
    return this._energy > 0 ? this._energy : 0
  }
  /**
   * Return the metadata of the game (id, difficulty, mode, spectrum, energy)
   * @function
   */
  get metadata () {
    return {
      id: this.id,
      difficulty: this.difficulty, // difficulty of the level
      mode: this.mode, // mode of the game (solo or coop)
      spectrum: this.spectrum,
      energy: this.energy // duration of the music
    }
  }

  /**
   * Reset the game parameters and keep the player in the room
   * @function
   */
  resetGame () {
    logger.info('Game reset : ' + this.id)

    this.stop()

    this.isGameStarted = false
    this.loopTimer = null
    this.currentBar = 0
    this.audioStream = null

    if (this.mode === 'solo') {
      this.energy = this.spectrum.artefactsToTakeCount
    } else {
      this.energy = this.spectrum.artefactsToTakeCount * 2
    }

    // Reset players
    for (let playerId in this.players) {
      this.players[playerId].prepareForGame()

      this.players[playerId].socket.emit('roomJoined', {
        roomId: this.id,
        gameMetadata: this.getMetaData(this.players[playerId])
      })
    }
  }

  /**
   * Return the number of artefact taken in the game
   * @function
   */
  get takenArtefactsCount () {
    let takenArtefactsCount = 0

    for (let player in this.players) {
      takenArtefactsCount += this.players[player].takenArtefactsCount
    }

    return takenArtefactsCount
  }
}
