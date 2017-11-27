const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket, number, user) {
    this.socket = socket
    this.number = number
    this.id = socket.id
    this.takenArtefactsCount = 0

    this._position = 0

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
    if ([0, 1, 2, 3].includes(position)) {
      this._position = position
    }
  }

  get position () {
    return this._position
  }
}
