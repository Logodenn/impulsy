const logger = require('../utils/logger')(module)
const Room = require('./Room')

const RoomManager = {
  io: null,

  init: (io) => {
    this.io = io
    this.rooms = {}

    this.io.on('connection', (socket) => {
      this.bindEvents(socket)
    })
  },

  bindEvents: (clientSocket) => {
    logger.info('RoomManager bindEvents for socket', clientSocket.id)

    clientSocket.on('joinRoom', (data) => {
      // Check if room exists
      if (this.rooms.hasOwnProperty(data.roomId)) {
        this.rooms[data.roomId].addPlayer(clientSocket)
      }
    })
  },

  createRoom: () => {
    const room = new Room(this.io)

    this.rooms[room.id] = room

    logger.info(`Room ${room.id} is created`)

    return room.id
  },

  deleteRoom: (room) => {
    delete this.rooms[room.id]

    logger.info(`Room ${room.id} is deleted`)
  }
}

module.exports = (io) => {
  RoomManager.init(io)

  return RoomManager
}