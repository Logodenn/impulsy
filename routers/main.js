const express = require('express')
const router = express.Router()
const getArrayArthefacts = require('../utils/artefacts')
const db = require('../models/controllers')
const audio = require('../modules/audio')
const share = require('social-share')
const numberOfTrend = 10
const numberOfUserMostPlayed = 10
const numberOfUserFavorite = 10
const barsPerSeconds = 2
const lineNumberHOF = 50
const logger = require('../utils/logger')(module)

/**
 * Route principale d'Impulsy
 */
router.get('/', (req, res) => {
  // Most played tracks
  db.track.getTrendTracks((err, trend) => {
    if (err) console.log(err)
    var data = {}
    data.trend = trend.slice(0, numberOfTrend)
    // User Most Played Tracks
    if (req.user) {
      db.track.getUserMostPlayedTracks(req.user.id, (err, userMostPlayed) => {
        if (err) console.log(err)
        data.userMostPlayed = userMostPlayed.slice(0, numberOfUserMostPlayed)
        // Favorite User track
        req.user.getFavoriteTracks((err, userFavorite) => {
          if (err) console.log(err)
          data.userFavorite = userFavorite.slice(0, numberOfUserFavorite)
          data.userConnected = true
          data.userName = req.user.pseudo
          res.render('index', data)
        })
      })
    } else {
      data.userConnected = false
      res.render('index', data)
    }
  })
})

/**
 * Route rendering the Hall of Fame
 * The page number allows us to select the ranks we want to see
 */
router.get('/hallOfFame/:pageNumber?', function (req, res) {
  var pageNumber
  var data = {}
  data.userConnected = false
  if (req.user) {
    data.userConnected = true
    data.userName = req.user.pseudo
  }
  if (typeof req.params.pageNumber === 'undefined') {
    pageNumber = 0
  } else {
    pageNumber = req.params.pageNumber
  }
  db.score.rank(pageNumber * lineNumberHOF, 0, (err, ranksSolo) => {
    if (err) logger.error(err)
    data.ranksSolo = ranksSolo
    db.score.rank(pageNumber * lineNumberHOF, 1, (err, ranksCoop) => {
      if (err) logger.error(err)
      data.ranksCoop = ranksCoop
      if (typeof req.user !== 'undefined') {
        db.score.rankUser(req.user.pseudo, 0, (err, userRankSolo) => {
          if (err) logger.error(err)
          db.score.rankUser(req.user.pseudo, 1, (err, userRankCoop) => {
            if (err) logger.error(err)
            if (userRankCoop.length > 0) {
              data.userCoopScore = userRankCoop[0].score_total
              data.userRankCoop = userRankCoop[0].rank
            }

            if (userRankSolo.length > 0) {
              data.userSoloScore = userRankSolo[0].score_total
              data.userRankSolo = userRankSolo[0].rank
            }

            res.render('hallOfFame', data)
          })
        })
      } else {
        res.render('hallOfFame', data)
      }
    })
  })
})

/**
 * Route rendering the How It Works page giving help to the players
 */
router.get('/howItWorks', function (req, res) {
  var data = {}
  data.userConnected = false
  if (req.user) {
    data.userConnected = true
    data.userName = req.user.pseudo
  }
  res.render('howItWorks', data)
})

/**
 * Unused
 * Renders a page to select the difficulty of the game
 */
router.get('/difficulty/:id', function (req, res) {
  var track
  var trackId = parseInt(req.params.id)
  var gameId = (Math.random() * 100000) | 0
  if (Number.isInteger(trackId)) {
    // It's from our database
    db.track.get(trackId, (err, result) => {
      if (err) console.log(err)
      else {
        track = result
        // stocker track dans un cookies
        if (track) {
          console.log(track)
          res.cookie('track', track)
          res.cookie('gameId', gameId)
          res.cookie('position', 1) // This is used by the front
          res.render('difficulty', {
            'gameId': gameId
          }) // Sets name = express
        } else {
          console.log(track)
        }
      }
    })
  } else {
    db.track.getTrackLink(req.params.id, (err, result) => {
      if (err) console.log(err)
      else {
        if (result) {
          track = result
          // stocker track dans un cookies
          if (track) {
            console.log(track)
            res.cookie('track', track)
            res.cookie('gameId', gameId)
            res.render('difficulty', {
              'gameId': gameId
            }) // Sets name = express
          } else {
            console.log(track)
          }
        } else {
          audio.getInfo(req.params.id, (err, result) => {
            if (err) console.log(err)
            else {
              audio.getYoutubeStream({
                videoId: req.params.id,
                quality: 'lowest'
              }, function (err, stream) {
                if (err) console.log(err)
                else {
                  audio.getAmplitudes(stream, barsPerSeconds, function (err, bars) {
                    if (err) console.log(err)
                    else {
                      var arraySpectrum = bars
                      var arrayArtefacts = getArrayArthefacts(arraySpectrum) // array of 0, 1, 2, 3 --- 0 upper and 3 lowest
                      let trackInformation = {
                        arraySpectrum: arraySpectrum,
                        arrayArtefacts: arrayArtefacts
                      }
                      var track = {
                        name: result.title,
                        link: req.params.id,
                        information: trackInformation
                      }
                      // add track to database
                      db.track.create(track, function (err, result) {
                        if (err) console.log(err)
                        else {
                          track.id = result.id
                          // stocker track dans un cookies
                          if (track) {
                            console.log(track)
                            res.cookie('track', track)
                            res.cookie('gameId', gameId)
                            res.render('difficulty', {
                              'gameId': gameId
                            }) // Sets name = express
                          } else {
                            console.log(track)
                          }
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  }
})

/**
 * Route allowing to set a track as a favorite for a user
 */
router.post('/favorite/:id', (req, res) => {
  if (req.user) {
    db.user.createFavoriteTrack(req.user.pseudo, req.params.id, (err, fav) => {
      if (err) {
        logger.error(err)
        res.sendStatus(500)
      } else {
        res.sendStatus(200)
      }
    })
  }
})

/**
 * Redirection to the service where the player wants to share his score
 */
router.get('/share', (req, res) => {
  var url = share(req.query.service, req.query)
  res.redirect(url)
})

module.exports = router
