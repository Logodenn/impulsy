const logger = require('../utils/logger')(module)
const Room = require('./Room')

const RoomManager = {
  io: null,

  bindEvents: (clientSocket) => {
    logger.info('RoomManager: bindEvents for socket', clientSocket.id)

    clientSocket.on('joinRoom', (data) => {
      // Check if room exists
      if (RoomManager.rooms.hasOwnProperty(roomId)) {
        RoomManager.rooms[data.roomId].addPlayer(clientSocket)
      }
    })
  },

  createRoom: () => {
    const room = new Room(RoomManager.io)

    RoomManager.rooms[room.id] = room

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
      logger.info(`RoomManager: new client ${socket.id}`)

      RoomManager.bindEvents(socket)
    })

    logger.info('RoomManager: ready')
  }
}

module.exports = RoomManager
