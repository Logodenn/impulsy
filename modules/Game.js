const uuid = require('uuid/v4')
const logger = require('../utils/logger')(module)

const GameManager = require('./GameManager')
const Player = require('./Player')

const gameSpeed = 500
const positionCheckDelay = 4000

module.exports = class Game {
  constructor (io) {
    this.id = uuid()
    this.isGameStarted = false

    // this.io = io.of(`/${this.id}`)
    this.io = io
    this.difficulty = 'lazy'

    this.players = {}
    this.loopTimer = null
    this.artefacts = [ 0, 2, 3, 2, 1, 2, 1, 2, 1 ]
    this.spectrum = [ 1, 0, 1, 0, 1, 1, 0, 0, 0 ]
    this.currentBar = 0
    this.energy = 100

    this.bindEvents()
  }

  bindEvents () {
    /* this.io.on('connection', (socket) => {
      this.joinGame(socket)

      socket.on('hostStartGame', () => { this.startGame() })
    }) */
  }

  destroy () {
    GameManager.getInstance().deleteGame(this)
  }

  startGame () {
    if (!this.energy || this.players.length === 0 || this.artefacts.length === 0) {
      logger.info('Everything is not setup correctly', this)
      return
    }

    logger.info(`Starting game ${this.id}`)
    this.io.emit('gameStarted')

    setTimeout(() => {
      this.loopTimer = setInterval(() => {
        logger.info(`Loop - currentBar ${this.currentBar}`)
        for (const player in this.players) {
          if (this.currentBar > this.artefacts.length) {
            this.win(player)
          } else if (player.energy === 0) {
            this.lose(player)
          } else {
            const data = this.checkRightPosition(player)

            player.socket.emit('energy', {
              data
            })

            this.currentBar += 1
          }
        }
      }, gameSpeed)
    }, positionCheckDelay)
  }

  joinGame (clientSocket) {
    logger.info(`New player - socket ${clientSocket.id}`)

    this.players[clientSocket.id] = new Player(clientSocket)

    clientSocket.on('disconnect', () => {
      delete this.players[clientSocket.id]

      logger.info(`Client ${clientSocket.id} is disconnected`)

      if (this.players.length === 0) {
        // this.gameManager.deleteGame(this)
      }
    })

    clientSocket.emit('gameJoined', { gameId: this.id })
    /* clientSocket.emit('newGameCreated', {
      game: { arrayArtefacts: this.artefacts, arraySpectrum: [ 0, 1, 1, 0, 1, 1, 1, 0, 1 ] },
      gg: this.positionCheckDelay
    }) */
  }

  win (player) {
    clearInterval(this.loopTimer)

    player.socket.emit('endOfGame', {
      'win': true,
      'score': player.takenArtefactsCount,
      'max': this.artefacts.length
    })

    /* score = {
      duration: game.currentBar,
      userId: 1, // int
      trackId: game.trackId
    }

    db.score.create(score, function (err, result) {
      if (err) logger.error(err)
    }) */

    player.disconnect(true)

    /* game.audioStreamPipe.pause()
    game.audioStreamPipe.destroy() */

    logger.info(`Game ${this.id}: Player ${player.socket.id} wins`)
  }

  checkRightPosition (player) {
    logger.info(`Check position for game ${this.id}`)
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
      gameId: this.id,
      socketId: this.io.id,
      position: player.position, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
      currentBar: this.currentBar,
      difficulty: this.difficulty, // difficulty of the level 
      energy: this.energy,
      isArtefactTaken: isArtefactTaken,
      // TODO: Change this name: 'nbArtefacts'
      nbArtefacts: player.takenArtefactsCount,
      bar: this.currentBar
    }
  }

  getMetaData () {
    return {
      game: {
        gameId: this.id,
        position: 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
        currentBar: 0, // TO BE DELETED
        difficulty: this.difficulty, // difficulty of the level
        arraySpectrum: this.spectrum,
        arrayArtefacts: this.artefacts,
        energy: 20, // duration of the music 
        track: 'ziizahi'
      }
    }
  }
}
