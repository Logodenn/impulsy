const logger = require('../utils/logger')(module)

module.exports = class Player {
  constructor (socket, number) {
    this.socket = socket
    this.number = number
    this.id = socket.id

    this._position = 0
  }

  set position (position) {
    // Check if this position is possible
    if ([0, 1, 2, 3].includes(position)) {
      this._position = position
    }
  }

  get name(){
    return `Guest ${this.number+1}`
  }
}
