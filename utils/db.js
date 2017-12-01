require('dotenv').config()

const async = require('async')
const moment = require('moment')

const logger = require('./logger')(module)
const models = require('../models/models')
const audio = require('../modules/audio')
const getArrayArthefacts = require('../utils/artefacts')
const Spectrum = require('../modules/Spectrum')

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
          let spectrum = new Spectrum()
          spectrum.createSpectrum('cKfOycpc0t0', false, callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 1,
            user_id: 1
          }, callback)
        },
        (score, callback) => {
          let spectrum = new Spectrum()
          spectrum.createSpectrum('HsrBhiLwz_I', false, callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 1,
            user_id: 2
          }, callback)
        },
        (score, callback) => {
          let spectrum = new Spectrum()
          spectrum.createSpectrum('Vs12XIPy1v8', false, callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 1,
            user_id: 1
          }, callback)
        },
        (score, callback) => {
          let spectrum = new Spectrum()
          spectrum.createSpectrum('001_Test_Impulsy_.mp3', true, callback)
        },
        (track, callback) => {
          createScore({
            track_id: track.id,
            date: moment().format('YYYY-MM-DD HH:mm:ss'),
            duration: 1,
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

const createScore = (_score, _callback) => {
  logger.info(`Creating score for track ${_score.track_id}`)

  db.models.score.create(_score, _callback)
}
