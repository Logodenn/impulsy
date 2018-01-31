// const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket, number, position, user) {
    this.id = socket.id
    this.number = number
    this.socket = socket
    this._position = position

    this.prepareForGame()

    if (user.logged_in) {
      this.user = {}
      this.user.id = user.id
      this.user.pseudo = user.pseudo
    }
  }

  get name () {
    if (this.user) {
      return this.user.pseudo
    }

    return `Guest ${this.number + 1}`
  }

  set position (position) {
    // Check if this position is possible
    if ([0, 1, 2, 3].includes(position.y)) {
      this._position.y = position.y
    }

    // x position can only move by one at a time
    if ([this.position.x - 1, this.position.x + 1].includes(position.x)) {
      this._position.x = position.x
    }
  }

  updateMaxXPosition () {
    if (this.position.x > this.maxXPosition) {
      this.maxXPosition = this.position.x
    }
  }

  get position () {
    return this._position
  }

  get metadata () {
    return {
      name: this.name,
      number: this.number,
      position: this._position,
      maxXPosition: this.maxXPosition
    }
  }

  prepareForGame () {
    this.takenArtefactsCount = 0
    this.artefactsTaken = []
    this.maxXPosition = 0
  }
}
