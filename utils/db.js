require('dotenv').config()

const async = require('async')
const moment = require('moment')

const logger = require('./logger')(module)
const models = require('../models/models')
const audio = require('../modules/audio')
const getArrayArthefacts = require('../utils/artefacts')

let db = null

models((err, _db) => {
  if (err) {
    return logger.error('Failed to get the database object')
  }

  db = _db

  db.drop((err) => {
    if (err) {
      return logger.error('Failed to drop tables')
    }

    db.sync((err) => {
      if (err) {
        return logger.error('Failed to synchronize tables')
      }

      async.waterfall([
        (callback) => {
          createUser({
            pseudo: 'user_test1',
            password: 'azerty',
            rank: '29'
          }, callback)
        },
        (user, callback) => {
          createUser({
            pseudo: 'user_test2',
            password: 'qsdfg',
            rank: '2'
          }, callback)
        },
        (user, callback) => {
          createYoutubeTrack('cKfOycpc0t0', callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 24,
            user_id: 1
          }, callback)
        },
        (score, callback) => {
          createYoutubeTrack('HsrBhiLwz_I', callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 12,
            user_id: 2
          }, callback)
        }
      ], (err, results) => {
        if (err) {
          return logger.error('Failed to fill tables')
        }

        logger.info('Database is now filled with mock data')
        process.exit()
      })
    })
  })
})

const createUser = (_user, _callback) => {
  logger.info(`Creating user '${_user.pseudo}'`)

  db.models.user.create(_user, _callback)
}

const createYoutubeTrack = (_videoId, _callback) => {
  const amplitudesFrequency = 2

  async.waterfall([
    (callback) => {
      audio.getYoutubeStream({
        videoId: 'cKfOycpc0t0',
        quality: 'lowest'
      }, (err, stream) => {
        if (err) {
          return callback(err)
        }

        callback(null, stream)
      })
    },
    (stream, callback) => {
      audio.getAmplitudes(stream, amplitudesFrequency, (err, bars) => {
        if (err) {
          return callback(err)
        }

        callback(null, bars)
      })
    },
    (bars, callback) => {
      const arrayArtefacts = getArrayArthefacts(bars)

      audio.getInfo(_videoId, (err, info) => {
        if (err) {
          return callback(err)
        }

        let track = {
          name: info.title,
          link: _videoId,
          information: {
            arraySpectrum: bars,
            arrayArtefacts: arrayArtefacts
          }
        }

        callback(null, track)
      })
    },
    (track, callback) => {
      db.models.track.create(track, (err, result) => {
        if (err) {
          return callback(err)
        }

        callback(null, result)
      })
    }
  ], (err, result) => {
    if (err) {
      logger.error(`Failed to create Youtube track ${_videoId}`)
    }

    logger.info(`Created Youtube track ${_videoId}`)

    _callback(null, result)
  })
}

const createScore = (_score, _callback) => {
  logger.info(`Creating score for track ${_score.track_id}`)

  db.models.score.create(_score, _callback)
}
