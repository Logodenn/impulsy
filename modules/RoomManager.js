const logger = require('../utils/logger')(module)
const Room = require('./Room')

const RoomManager = {
  io: null,

  bindEvents: (clientSocket) => {
    logger.info('RoomManager bindEvents for socket', clientSocket.id)

    clientSocket.on('joinRoom', (roomId) => {
      // Check if room exists
      if (RoomManager.rooms.hasOwnProperty(roomId)) {
        RoomManager.rooms[roomId].addPlayer(clientSocket)
      }
    })
  },

  createRoom: () => {
    const room = new Room(RoomManager.io)

    RoomManager.rooms[room.id] = room

    logger.info(`Room ${room.id} is created`)

    return room.id
  },

  deleteRoom: (room) => {
    delete RoomManager.rooms[room.id]

    logger.info(`Room ${room.id} is deleted`)
  },

  init: (io) => {
    RoomManager.io = io
    RoomManager.rooms = {}

    RoomManager.io.on('connection', (socket) => {
      RoomManager.bindEvents(socket)
    })
  }
}

module.exports = RoomManager
