const logger = require('../utils/logger')(module)
const Game = require('./Game')

let instance = null

module.exports = class GameManager {
  constructor (io) {
    this.io = io
    this.games = {}

    this.bindEvents()
  }

  static getInstance () {
    return instance
  }

  bindEvents () {
    logger.info('GameManager bindEvents')

    this.io.on('connection', (socket) => {
      socket.on('hostCreateNewGame', () => {
        const gameId = this.createGame()

        socket.emit('newGameCreated', this.games[gameId].getMetaData())
      })
    })
  }

  createGame () {
    const game = new Game(this.io)

    this.games[game.id] = game

    logger.info(`Game ${game.id} is created`)

    return game.id
  }

  deleteGame (game) {
    delete this.games[game.id]

    logger.info(`Game ${game.id} is deleted`)
  }
}
