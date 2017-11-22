const logger = require('../utils/logger')(module)
const uuid = require('uuid/v4')
const SlowStream = require('slow-stream')
const Player = require('./Player')
const Spectrum = require('./Spectrum')
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
    let getStream = audio.getYoutubeStream;

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
        logger.error(`Could not retreive stream for sound: ${sound}`)

        return
      }

      self.audioStream = command.pipe(new SlowStream({
        maxWriteInterval: 50
      }))

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
    })

    logger.info(`Starting game on room ${this.id}`)

    // Notify all players that the game has started
    for (var playerId in this.players) {
      this.players[playerId].socket.emit('gameStarted')
    }

    setTimeout(() => {
      this.loopTimer = setInterval(() => {
        logger.debug(`Loop - currentBar ${this.currentBar} - ${this.spectrum.bars.length}`)

        for (let key in this.players) {
          let player = this.players[key]

          if (this.currentBar >= this.spectrum.bars.length) {
            this.win(player)
          } else if (player.energy === 0) {
            this.lose(player)
          } else {
            const data = this.check(player)

            player.socket.emit('updateGame', {
              data
            })
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
      player.socket.emit('countDown', {duration: 3})
      // startGame
      self.startGame()
    })

    player.socket.on('disconnect', () => {
      self.onPlayerDisconnect(player.socket)
    })
  }

  onPlayerDisconnect (socket) {
    logger.info(`Room ${this.id} - Client ${socket.id} is disconnected`)

    delete this.players[socket.id]

    if (this.players.length === 0) {
      this.destroy()
    } else {
      for (var playerId in this.players) {
        this.players[playerId].socket.emit('playerDisconnected', this.players[socket.id].name)
      }
    }
  }

  win (player) {
    logger.info(`Game in room ${this.id}: Player ${player.socket.id} won`)

    // Stop the game loop
    clearInterval(this.loopTimer)

    player.socket.emit('endOfGame', {
      'win': true,
      'score': player.takenArtefactsCount,
      'max': this.energy
    })
  }
/*
  checkRightPosition (player) {
    logger.info(`Room ${this.id} - check position for player ${player.id}`)

    let isArtefactTaken = false

    if (player.position !== this.artefacts[this.currentBar] && this.difficulty === 'easy') {
      this.energy = this.energy - 1
      isArtefactTaken = false
    } else if (this.position === this.arrayArtefacts[this.currentBar] && this.difficulty === 'crazy') {
      this.energy = this.energy - 1
      this.nbArtefacts = this.nbArtefacts + 1
      isArtefactTaken = true
    } else if (this.position !== this.arrayArtefacts[this.currentBar] && this.difficulty === 'crazy') {
      this.energy = this.energy - 2
      isArtefactTaken = false
    } else if (this.position === this.arrayArtefacts[this.currentBar] && this.difficulty === 'easy') {
      this.energy = this.energy
      this.nbArtefacts = this.nbArtefacts + 1
      isArtefactTaken = true
    } else if (this.difficulty === 'lazy' && this.position === this.arrayArtefacts[this.currentBar]) {
      logger.debug('Level lazy no energy')
      this.nbArtefacts = this.nbArtefacts + 1
      isArtefactTaken = true
    } else if (this.difficulty === 'lazy' && this.position !== this.arrayArtefacts[this.currentBar]) {
      logger.debug('Level lazy no energy')
      isArtefactTaken = false
    } else {
      logger.error('Check the difficulty or the current bar something is going wrong')
    }

    if(!isArtefactTaken) {
      player.socket.emit('missedArtefact', {
        'failingPlayer': player,
        'barId': null, // TODO
      })
    }

    return {
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      energy: this.energy,
      isArtefactTaken: isArtefactTaken,
      // TODO: Change this name: 'nbArtefacts'
      barsCount: player.takenArtefactsCount,
      bar: this.currentBar
    }
  }
*/
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
        this.takenArtefactsCount = this.takenArtefactsCount + 1
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
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      energy: this.energy,
      isArtefactTaken: artefactTaken,
      barsCount: player.takenArtefactsCount,
      bar: this.currentBar
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
