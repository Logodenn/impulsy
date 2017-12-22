const logger = require('../utils/logger')(module)
const uuid = require('uuid/v4')
const Player = require('./Player')
const Spectrum = require('./Spectrum')
const db = require('../models/controllers')
const audio = require('./audio')

const gameSpeed = 500
const positionCheckDelay = 4000

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
    // Useless ? ?
    // let i = 0
    // for (var playerId in this.players){
    //   for (let elem in this.spectrum.bars){
    //     this.play
    //     artefactsTaken[i] = false
    //     i++
    //   }
    // }

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
      this.loopTimer = setInterval(() => {
        logger.debug(`Loop - currentBar ${this.currentBar} - ${this.spectrum.bars.length} - energy ${this.energy}`)

        this.currentBar++

        if (this.players.length === 0) {
          this.stop()
        }

        if (this.currentBar >= this.spectrum.bars.length - 1) {
          this.win()
        } else if (this.energy <= 0) {
          this.lose()
        } else {
          if (this.currentBar > 0) {
            this.loseEnergy()
          }

          for (let key in this.players) {
            const player = this.players[key]

            let data = this.check(player, this.currentBar, false)
            for (let playerId in this.players) {
              this.players[playerId].socket.emit('updateGame', data)
            }

            // This checks for the bar before the current one
            if (this.currentBar > 1) {
              let data = this.check(player, this.currentBar - 1)

              if (data.isArtefactTaken) {
                for (let playerId in this.players) {
                  this.players[playerId].socket.emit('updateGame', data)
                }
              }
            }
          }
        }
      }, gameSpeed)
    }, positionCheckDelay)
  }

  addPlayer (clientSocket) {
    logger.info(`Room ${this.id} - New player ${clientSocket.id}`)

    const currentNumberOfPlayers = Object.keys(this.players).length

    this.players[clientSocket.id] = new Player(clientSocket, currentNumberOfPlayers, clientSocket.request.user)

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
        if (self.players[playerId].position === data.position) {
          // This means there is already someone at this position
          canMove = false
        }
      }

      if (canMove) {
        player.position = data.position

        for (let playerId in self.players) {
          self.players[playerId].socket.emit('playerMove', data)
        }

        // Check is we are still playing and if the loop has started
        if (self.currentBar < self.spectrum.bars.length && this.loopTimer && this.currentBar >= 0) {
          const checkData = self.check(player, self.currentBar)

          for (var playerId in self.players) {
            self.players[playerId].socket.emit('updateGame', checkData)
          }

          // This checks for the bar before the current one
          if (self.currentBar > 1) {
            let data = self.check(player, self.currentBar - 1)

            if (data.isArtefactTaken) {
              for (let playerId in self.players) {
                this.players[playerId].socket.emit('updateGame', data)
              }
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

  check (player, barNumber) {
    let artefactTaken = false

    if (!player.artefactsTaken[barNumber] && barNumber >= 0) {
      artefactTaken = this.spectrum.checkArtefacts(barNumber, player)

      if (artefactTaken !== null) {
        player.artefactsTaken[barNumber] = artefactTaken

        if (artefactTaken) {
          player.takenArtefactsCount++
          this.gainEnergy()
        }
      }
    }

    return {
      bar: barNumber,
      takenArtefactsCount: this.takenArtefactsCount,
      energy: this.energy,
      isArtefactTaken: artefactTaken,
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      playerNumber: player.number
    }
  }

  loseEnergy () {
    if (this.spectrum.bars[this.currentBar].artefacts[0] !== null) {
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
      position: player.number + 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
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
