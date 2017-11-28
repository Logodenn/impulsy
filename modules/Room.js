const logger = require('../utils/logger')(module)
const uuid = require('uuid/v4')
const Player = require('./Player')
const Spectrum = require('./Spectrum')
const db = require('../models/controllers')
const audio = require('./audio')

const gameSpeed = 500
const positionCheckDelay = 4000

module.exports = class Room {
  constructor (_difficulty) {
    this.id = uuid()
    this.isGameStarted = false
    this.roomManager = require('./RoomManager').getInstance()

    this.players = {}
    this.loopTimer = null
    this.spectrum = new Spectrum()
    this.difficulty = _difficulty
    this.currentBar = 0
    this.energy = 100
    this.audioStream = null
  }

  destroy () {
    this.roomManager.deleteRoom(this)
  }

  startGame () {
    if (!this.energy || this.players.length === 0 || this.spectrum.bars.length === 0) {
      logger.info('Everything is not setup correctly', this)
      return
    }

    let sound = this.spectrum.link
    let getStream = audio.getYoutubeStream

    // May not be the best way to check if the track is local or not
    if (sound === null) {
      getStream = audio.getLocalStream
      sound = this.spectrum.name
    }

    let self = this

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

    this.currentBar = 0

    setTimeout(() => {
      this.loopTimer = setInterval(() => {
        logger.debug(`Loop - currentBar ${this.currentBar} - ${this.spectrum.bars.length}`)

        if (this.players.length === 0) {
          this.stop()
        }

        for (let key in this.players) {
          const player = this.players[key]

          if (this.currentBar >= this.spectrum.bars.length) {
            this.win(player)
          } else if (this.energy <= 0) {
            this.lose(player)
          } else {
            const data = this.check(player)

            for (var playerId in this.players) {
              this.players[playerId].socket.emit('updateGame', data)
            }
          }
        }

        this.currentBar++
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
        this.players[playerId].socket.emit('newPlayer', this.players[clientSocket.id].name)
      }
    }
  }

  bindPlayerEvents (player) {
    const self = this

    player.socket.on('startGame', () => {
      // triggerCountdown
      player.socket.emit('countDown', {
        duration: 3
      })
      // startGame
      self.startGame()
    })

    player.socket.on('playerMove', (data) => {
      player.position = data
    })

    player.socket.on('disconnect', () => {
      self.onPlayerDisconnect(player.socket)
    })
  }

  stop () {
    if (this.audioStream) {
      this.audioStream.pause()
      this.audioStream.unpipe()
    }

    if (this.loopTimer) {
      clearInterval(this.loopTimer)
    }
  }

  onPlayerDisconnect (socket) {
    logger.info(`Room ${this.id} - Client ${socket.id} is disconnected`)

    const playerName = this.players[socket.id].name

    delete this.players[socket.id]

    this.stop()

    if (this.players.length === 0) {
      this.destroy()
    } else {
      for (var playerId in this.players) {
        this.players[playerId].socket.emit('playerDisconnected', playerName)
      }
    }
  }

  win (player) {
    logger.info(`Game in room ${this.id}: Player ${player.socket.id} won`)

    // Stop the game loop
    this.stop()

    player.socket.emit('gameOver', {
      'win': true,
      'score': player.takenArtefactsCount,
      'max': this.energy
    })

    // This is, for now, done sytematically. It might be better to ask the user before adding the score
    this.addScore(player)
  }

  lose (player) {
    logger.info(`Game in room ${this.id}: Player ${player.socket.id} lost`)

    // Stop the game loop
    this.stop()

    player.socket.emit('gameOver', {
      'win': false,
      'score': player.takenArtefactsCount,
      'max': this.energy
    })

    // This is, for now, done sytematically. It might be better to ask the user before adding the score
    this.addScore(player)
  }

  addScore (player) {
    if (player.user) {
      const score = {
        duration: player.takenArtefactsCount,
        user_id: player.user.id,
        track_id: this.spectrum.id
      }

      db.user.bestScores(player.user.id, this.spectrum.id, (err, bestScores) => {
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

  check (player) {
    const artefactTaken = this.spectrum.checkArtefacts(this.currentBar, player)
    if (artefactTaken !== null) {
      if (artefactTaken) {
        switch (this.difficulty) {
          case 'crazy':
            this.energy = this.energy - 1
            break
          case 'easy':
            // Energy doesn't change
            this.energy = this.energy
            break
          case 'lazy':
            // Do stuff
            break
          default:
            logger.error('Check the difficulty or the current bar something is going wrong')
        }
        player.takenArtefactsCount += 1
      } else {
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
    return {
      bar: this.currentBar,
      barsCount: player.takenArtefactsCount,
      energy: this.energy,
      isArtefactTaken: artefactTaken,
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      playerNumber: player.number
    }
  }

  getMetaData (player) {
    return {
      id: this.id,
      position: player.number + 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      currentBar: 0, // TO BE DELETED
      difficulty: this.difficulty, // difficulty of the level
      spectrum: this.spectrum,
      artefacts: this.artefacts,
      energy: this.energy // duration of the music
    }
  }

  get metadata () {
    return {
      id: this.id,
      difficulty: this.difficulty, // difficulty of the level
      spectrum: this.spectrum,
      energy: this.energy // duration of the music
    }
  }
}
