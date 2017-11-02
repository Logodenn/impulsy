'use strict'

module.exports = class Player {
  constructor (socket) {
    this.socket = socket
  }

  bindEvents () {
    // Player Events
    this.socket.on('playerMove', this.onPlayerMove)
    this.socket.on('endGame', this.onEndGame)
    this.socket.on('disconnect', this.onDisconnect)
  }

  onPlayerMove () {

  }

  onEndGame () {

  }
}
