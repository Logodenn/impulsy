const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket, number, position, user) {
    this.id = socket.id
    this.number = number
    this.socket = socket
    this.artefactsTaken = []
    this._position = position
    this.takenArtefactsCount = 0

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
    } else {
      this._position.y = 1
    }

    // TODO : check x
    this._position.x = position.x
  }

  get position () {
    return this._position
  }

  get metadata () {
    return {
      name: this.name,
      number: this.number,
      position: this._position
    }
  }
}
