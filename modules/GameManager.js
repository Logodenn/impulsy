const logger = require('../utils/logger')
const Game = require('./Game')

module.exports = class GameManager {
  constructor (io) {
    this.io = io
    this.games = {}

    this.bindEvents()
  }

  bindEvents () {
    this.io.sockets.on('hostCreateNewGame', () => {
      this.createGame()
    })
  }

  createGame () {
    const game = new Game(this, this.io)

    this.games[game.id] = game
  }

  deleteGame (game) {
    delete this.games[game.id]

    logger.info(`Game ${game.id} is deleted`)
  }
}
