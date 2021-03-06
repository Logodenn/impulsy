const logger = require('../utils/logger')(module)
const express = require('express')
const RoomManager = require('../modules/RoomManager').getInstance()
const router = express.Router()
const Spectrum = require('../modules/Spectrum')
const db = require('../models/controllers')

/**
 * Main route allowing to create new rooms
 * Redirects to the created room
 */
router.post('/', (req, res) => {
  const difficulty = req.body.difficulty
  const id = req.body.track
  const mode = req.body.mode
  // console.log(req.body.gameData)
  if (req.body.gameData) {
    console.log(JSON.parse(req.body.gameData))
  }
  if (!difficulty || !id) {
    logger.error(`Wrong value for id or difficulty --> id: ${id} - difficulty: ${difficulty}`)

    res.status(400).redirect('/')
  }

  db.track.get(id, (err, track) => {
    if (err === null) {
      // 'id' is a trackId and it is in the database
      logger.info(`Track is in our database: ${track.name} with trackId ${id}`)
      return RoomManager.createRoom(track.id, difficulty, mode, (err, roomId) => {
        if (err) {
          return res.status(500).redirect('/')
        }

        res.redirect(`/room/${roomId}`)
      })
    }

    db.track.getTrackLink(id, (err, track) => {
      if (err === null && track) {
        // 'id' is a youtubeId and it is in the database
        logger.info(`Track is in our database: ${track.name} with youtubeId ${id}`)
        return RoomManager.createRoom(track.id, difficulty, mode, (err, roomId) => {
          if (err) {
            return res.status(500).redirect('/')
          }

          res.redirect(`/room/${roomId}`)
        })
      }

      // 'id' is not in our database
      const spectrum = new Spectrum()
      logger.info('Creating spectrum')
      spectrum.createSpectrum(id, false, (err, result) => {
        if (err !== null) {
          return res.status(500).redirect('/')
        }

        logger.info('Spectrum created')
        RoomManager.createRoom(result.id, difficulty, mode, (err, roomId) => {
          if (err) {
            return res.status(500).redirect('/')
          }

          res.redirect(`/room/${roomId}`)
        })
      })
    })
  })
})

/**
 * User can join a room by using the route and entering the gameId as a parameter
 * If room is full or cannot be joined, user is redirected
 */
router.get('/:id', (req, res) => {
  const roomId = req.params.id

  if (RoomManager.rooms.hasOwnProperty(roomId)) {
    const room = RoomManager.rooms[roomId]

    if (room.canBeJoined()) {
      let data = {
        metadata: RoomManager.rooms[roomId].metadata,
        userConnected: false
      }

      if (req.user) {
        data.userConnected = true
        data.userName = req.user.pseudo
      }

      res.render('game', data)
    } else {
      res.status(400).redirect('/')
    }
  } else {
    res.status(404).redirect('/')
  }
})

module.exports = router
