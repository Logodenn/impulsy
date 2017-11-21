const logger = require('../utils/logger')(module)
const express = require('express')
const RoomManager = require('../modules/RoomManager').getInstance()
const router = express.Router()
const Spectrum = require('../modules/Spectrum')
const db = require('../models/controllers')

router.post('/', (req, res) => {
  const difficulty = req.body.difficulty
  const id = req.body.track

  if (!difficulty || !id) {
    logger.error(`Wrong value for id or difficulty --> id: ${id} - difficulty: ${difficulty}`)

    res.status(400).redirect('/')
  }

  db.track.get(id, (err, track) => {
    if (err === null) {
      // 'id' is a trackId and it is in the database
      logger.info(`Track is in our database: ${track.name} with trackId ${id}`)
      return RoomManager.createRoom(track.id, difficulty, (err, roomId) => {
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
        return RoomManager.createRoom(track.id, difficulty, (err, roomId) => {
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
        RoomManager.createRoom(result.id, difficulty, (err, roomId) => {
          if (err) {
            return res.status(500).redirect('/')
          }

          res.redirect(`/room/${roomId}`)
        })
      })
    })
  })
  /* if (Number.isInteger(trackId)) {
    roomId = RoomManager.createRoom(trackId)
    res.redirect(`/room/${roomId}`)
  } else {
    // It's from Youtube
    db.track.getTrackLink(req.params.id, (err, result) => {
      if (err) console.log(err)
      else {
        if (result) {
          // In our database
          roomId = RoomManager.createRoom(trackId)
          res.redirect(`/room/${roomId}`)
        } else {
          // New sound
          var spectrum = new Spectrum()
          spectrum.createSpectrum(trackId, false, (err, result) => {
            if (err) console.log(err)
            else {
              roomId = RoomManager.createRoom(trackId)
              res.redirect(`/room/${roomId}`)
            }
          })
        }
      }
    })
  } */
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view

  res.render('game')
})

module.exports = router
