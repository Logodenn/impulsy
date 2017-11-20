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

  createRoom () {
    const room = new Room(this.io)

    this.rooms[room.id] = room
    logger.info("Room " + room.id + " created");
    return room.id
  }

  deleteRoom (room) {
    delete this.rooms[room.id]

    logger.info(`Room ${room.id} is deleted`)
  }
}
