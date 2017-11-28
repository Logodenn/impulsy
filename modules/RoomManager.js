const logger = require('../utils/logger')(module)
const Room = require('./Room')

let instance = null

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

  static getInstance (io) {
    if (instance === null) {
      instance = new this(io)
    }

    return instance
  }

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

  createRoom (_trackId, _difficulty, _mode, _callback) {
    const room = new Room(_difficulty, _mode)

    this.rooms[room.id] = room

    room.spectrum.loadSpectrum(_trackId, (err, res) => {
      if (err) {
        logger.error(err)

        return _callback(err)
      }

      let energy = 0
      this.rooms[room.id].spectrum.bars.forEach(bar => {
        if (bar.artefacts[0] !== null && bar.artefacts[1] !== null) {
          energy++
        }
      })

      this.rooms[room.id].energy = energy

      logger.info(`Room ${room.id} is created with parameters: {
        trackId: ${_trackId},
        difficulty: ${_difficulty},
        mode: ${_mode}
      }`)
      _callback(null, room.id)
    })
  }

  deleteRoom (room) {
    delete this.rooms[room.id]

    logger.info(`Room ${room.id} is deleted`)
  }
}
