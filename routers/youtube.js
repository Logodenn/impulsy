const logger = require('../utils/logger')(module)
const express = require('express')
const youtube = require('../modules/youtube')
const audio = require('../modules/audio')

const router = express.Router()

router.get('/search/:keywords', (req, res) => {
  let _tracksCount = 5

  youtube.search({
    keywords: req.params.keywords,
    tracksCount: _tracksCount
  }, (err, data) => {
    if (err) {
      logger.error(err)
      res.status(404)
    }

    let tracks = []

    data.items.forEach((element) => {
      audio.getInfo(element.id.videoId, (err, info) => {
        if (err) {
          return logger.error(err)
        }

        tracks.push(info)

        if (tracks.length >= _tracksCount) {
          res.json(tracks)
          res.end()
        }
      })
    })
  })
})

module.exports = router
