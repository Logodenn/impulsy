const uuid = require('uuid/v4')
const logger = require('../utils/logger')(module)

const RoomManager = require('./RoomManager')
const Player = require('./Player')

const gameSpeed = 500
const positionCheckDelay = 4000

module.exports = class Room {
  constructor () {
    this.id = uuid()
    this.isGameStarted = false

    this.players = {}
    this.loopTimer = null
    this.artefacts = [0, 2, 3, 2, 1, 2, 1, 2, 1]
    this.spectrum = [1, 0, 1, 0, 1, 1, 0, 0, 0]
    this.difficulty = 'lazy'
    this.currentBar = 0
    this.energy = 100

    this.bindEvents()
  }

  destroy () {
    RoomManager.deleteRoom(this)
  }

  startGame () {
    if (!this.energy || this.players.length === 0 || this.artefacts.length === 0) {
      logger.info('Everything is not setup correctly', this)
      return
    }

    logger.info(`Starting game on room ${this.id}`)
    this.io.emit('gameStarted')

    setTimeout(() => {
      this.loopTimer = setInterval(() => {
        logger.debug(`Loop - currentBar ${this.currentBar}`)

        for (const player in this.players) {
          if (this.currentBar > this.artefacts.length) {
            this.win(player)
          } else if (player.energy === 0) {
            this.lose(player)
          } else {
            const data = this.checkRightPosition(player)

            player.socket.emit('updateGame', {
              data
            })
          }
        }

        this.currentBar += 1
      }, gameSpeed)
    }, positionCheckDelay)
  }

  addPlayer (clientSocket) {
    logger.info(`Room ${this.id} - New player - socket ${clientSocket.id}`)

    this.players[clientSocket.id] = new Player(clientSocket)

    clientSocket.emit('gameJoined', {
      gameId: this.id
    })
  }

  bindPlayerEvents (player) {
    const socket = player.socket

    socket.on('disconnect', () => {
      this.onPlayerDisconnect(socket)
    })
  }

  onPlayerDisconnect (socket) {
    logger.info(`Room ${this.id} - Client ${socket.id} is disconnected`)

    delete this.players[socket.id]

    if (this.players.length === 0) {
      // this.gameManager.deleteGame(this)
    }
  }

  win (player) {
    logger.info(`Game in room ${this.id}: Player ${player.socket.id} won`)

    // Stop the game loop
    clearInterval(this.loopTimer)

    player.socket.emit('endOfGame', {
      'win': true,
      'score': player.takenArtefactsCount,
      'max': this.artefacts.length
    })
  }

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

    return {
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      energy: this.energy,
      isArtefactTaken: isArtefactTaken,
      // TODO: Change this name: 'nbArtefacts'
      barsCount: player.takenArtefactsCount,
      bar: this.currentBar
    }
  }

  getMetaData () {
    return {
      id: this.id,
      position: 0, // here 0, 1, 2, 3 --- 0 upper and 3 lowest
      currentBar: 0, // TO BE DELETED
      difficulty: this.difficulty, // difficulty of the level
      spectrum: this.spectrum,
      artefacts: this.artefacts,
      energy: this.energy, // duration of the music
      track: 'ziizahi'
    }
  }
}
