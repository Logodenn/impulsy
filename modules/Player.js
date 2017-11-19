const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket, number, user) {
    this.socket = socket
    this.number = number
    this.id = socket.id

    this._position = 0

    this.user = {}

    if (user) {
      this.user.id = user.id
      this.user.pseudo = user.pseudo
    }
  }

  get name () {
    return this.user.pseudo || `Guest ${this.number + 1}`
  }

  set position (position) {
    // Check if this position is possible
    if ([0, 1, 2, 3].includes(position)) {
      this._position = position
    }
  }
}
