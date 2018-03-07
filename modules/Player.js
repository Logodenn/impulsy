// const logger = require('../utils/logger')(module)
/**
 * Object Player 
 * @class
 * @param id id of the player
 * @param {int} number number of the player
 * @param socket socket for this player
 * @param _position position of the player in the spectrum 
 */
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
  /**
   * Return the name of the player
   */
  get name () {
    if (this.user) {
      return this.user.pseudo
    }

    return `Guest ${this.number + 1}`
  }

  /**
   * Set the position of the player
   */
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

  /**
   * Check if the player should loose energy or not
   */
  updateMaxXPosition () {
    if (this.position.x > this.maxXPosition) {
      this.maxXPosition = this.position.x
    }
  }

  /**
   * Return the position of the player
   */
  get position () {
    return this._position
  }

  /**
   * Return the metadata of the player (name, number, postion, maxposition)
   */
  get metadata () {
    return {
      name: this.name,
      number: this.number,
      position: this._position,
      maxXPosition: this.maxXPosition
    }
  }

  /**
   * Set player informations (position, number of artefacts taken, ...) to default 
   */
  prepareForGame () {
    this.takenArtefactsCount = 0
    this.artefactsTaken = []
    this.maxXPosition = 0
    this._position = {
      x: 0,
      y: this.number
    }
  }
}
