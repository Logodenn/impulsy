const express = require('express')
const RoomManager = require('../modules/RoomManager')
const router = express.Router()

router.post('/', (req, res) => {
  const roomId = RoomManager.createRoom()

  res.redirect(`/room/${roomId}`)
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view
  res.render('game')
})

module.exports = router
