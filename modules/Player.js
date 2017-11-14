const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket) {
    this.socket = socket
    this.id = socket.id

    this._position = 0
    this.name = 'Guest 1'
  }

  set position (position) {
    // Check if this position is possible
    if ([0, 1, 2, 3].includes(position)) {
      this._position = position
    }
  }
}