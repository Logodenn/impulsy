const orm = require('orm')
const express = require('express')
const router = express.Router()
const helpers = require('./_helpers')
const logger = require('../utils/logger')(module)

/**
 * Main route of the scores display pages
 */
router.get('/', (req, res, next) => {
  req.models.score.find().limit(4).all(function (err, scores) {
    if (err) {
      logger.debug(err)
      return next(err)
    }

    let items = scores.map(function (m) {
      return m.serialize()
    })

    res.send({
      items: items
    })
  })
})

/**
 * This POST route allows to add a new score to the database
 */
router.post('/', (req, res, next) => {
  if (!req.body) return res.sendStatus(400)

  let params = req.body

  req.models.user.get(params.user_id, function (err, user) {
    if (err) {
      logger.debug(err)
      if (err.code === orm.ErrorCodes.NOT_FOUND) {
        return res.status(404).send('User not found')
      } else {
        return next(err)
      }
    }

    req.models.track.get(params.track_id, function (err, track) {
      if (err) {
        logger.debug(err)
        if (err.code === orm.ErrorCodes.NOT_FOUND) {
          return res.status(404).send('Track not found')
        } else {
          return next(err)
        }
      }

      params.date = new Date().toLocaleString()

      req.models.score.create(params, function (err, score) {
        if (err) {
          logger.debug(err)
          if (Array.isArray(err)) {
            return res.status(200).send({
              errors: helpers.formatErrors(err)
            })
          } else {
            return next(err)
          }
        }

        logger.info('score ' + score.id + ' created !')

        return res.status(200).send(score.serialize())
      })
    })
  })
})

/**
 * This route allows to delete a score from the database
 */
router.delete('/', (req, res, next) => {
  if (!req.body) return res.sendStatus(400)

  let params = req.body

  req.models.score.get(params.score_id, function (err, score) {
    if (err) {
      logger.debug(err)
      if (err.code === orm.ErrorCodes.NOT_FOUND) {
        return res.status(404).send('Score not found')
      } else {
        return next(err)
      }
    }
    score.remove(function (err) {
      if (err) {
        logger.debug(err)
        return next(err)
      }

      logger.info('score ' + score.id + ' removed !')
    })

    return res.status(202).send('removed')
  })
})

/**
 * This route allows to update a score in the database
 */
router.post('/update', (req, res, next) => {
  if (!req.body) return res.sendStatus(400)

  let params = req.body

  req.models.score.get(params.score_id, function (err, score) {
    if (err) {
      logger.debug(err)
      if (err.code === orm.ErrorCodes.NOT_FOUND) {
        return res.status(404).send('Score not found')
      } else {
        return next(err)
      }
    }
    if (params.date) score.date = params.date

    if (params.duration) score.duration = params.duration

    score.save(function (err) {
      if (err) {
        logger.debug(err)
        return next(err)
      }
      return res.status(200).send(score.serialize())
    })
  })
})

module.exports = router
