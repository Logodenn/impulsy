const logger = require('../utils/logger')(module)
const Room = require('./Room')

let instance = null

/**
 * RoomManager Object, permit the gestion of the differents rooms for the differents games 
 * @class 
 */
exports = module.exports = class RoomManager {
  constructor (io) {
    this.io = io
    this.rooms = {}

    let self = this

    self.io.on('connection', (socket) => {
      logger.info(`RoomManager: new client ${socket.id}`)

      self.bindEvents(socket)
    })

    logger.info('RoomManager: ready')
  }

  /**
   * Return the instance of roomManager in order to have only one object 
   * @param io 
   */
  static getInstance (io) {
    if (instance === null) {
      instance = new this(io)
    }

    return instance
  }
  
  /**
   * Add a player to a room 
   * @param {*} clientSocket 
   */
  bindEvents (clientSocket) {
    logger.info('RoomManager: bindEvents for socket', clientSocket.id)

    let self = this

    clientSocket.on('joinRoom', (data) => {
      // Check if room exists
      if (self.rooms.hasOwnProperty(data.roomId)) {
        self.rooms[data.roomId].addPlayer(clientSocket)
      }
    })
  }

  /**
   * Create the room to start a game for the player(s)
   * @function
   * @param {*} _trackId 
   * @param {*} _difficulty 
   * @param {*} _mode 
   * @param {*} _callback 
   */
  createRoom (_trackId, _difficulty, _mode, _callback) {
    const room = new Room(_difficulty, _mode)

    this.rooms[room.id] = room

    room.spectrum.loadSpectrum(_trackId, _mode, (err, res) => {
      if (err) {
        logger.error(err)

        return _callback(err)
      }

      let energy = 0
      this.rooms[room.id].spectrum.bars.forEach(bar => {
        if (bar.artefacts[0] !== null && bar.artefacts[1] !== null) {
          energy++

          if (room.mode === 'coop') {
            energy++
          }
        }
      })

      this.rooms[room.id].energy = energy

      logger.info(`Room ${room.id} is created with parameters:`)
      logger.info(`\t- trackId: ${_trackId}`)
      logger.info(`\t- difficulty: ${_difficulty}`)
      logger.info(`\t- mode: ${_mode}`)

      _callback(null, room.id)
    })
  }

  /**
   * Delete the room if the game is over 
   * @function
   * @param {Room} room 
   */
  deleteRoom (room) {
    delete this.rooms[room.id]

    logger.info(`Room ${room.id} is deleted`)
  }
}
