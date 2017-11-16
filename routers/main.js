const express = require('express')
const router = express.Router()
const getArrayArthefacts = require('../utils/artefacts')
const db = require('../models/controllers')
const cookies = require('cookies')
const audio = require('../modules/audio')
const numberOfTrend = 10
const numberOfUserMostPlayed = 10
const numberOfUserFavorite = 10
const barsPerSeconds = 2

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
          res.render('index', data)
        })
      })
    } else {
      data.userConnected = false
      res.render('index', data)
    }
  })
})

router.get('/hallOfFame', function (req, res) {
  db.track.usedTracks((err, tracks) => {
    if (err) console.log(err);
    console.log(tracks);
    res.render('hallOfFame', tracks);
  })
});

router.get('/howItWorks', function (req, res) {
  res.render('howItWorks', {
    message: 'Hello World!'
  })
})

router.get('/trackSelection', function (req, res) {
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
          res.render('trackSelection', data)
        })
      })
    } else {
      data.userConnected = false
      res.render('trackSelection', data)
    }
  })
})

router.get('/difficulty/:id', function (req, res) {
    var track;
    var trackId = parseInt(req.params.id);
    var gameId = (Math.random() * 100000) | 0;
    if (Number.isInteger(trackId)) {
      // It's from our database
      db.track.get(trackId, (err, result) => {
        if (err) console.log(err);
        else {
          track = result;
            // stocker track dans un cookies
            if (track) {
                console.log(track);
                res.cookie('track', track);
                res.cookie('gameId', gameId);
                res.cookie('position', 1); // This is used by the front
                res.render('difficulty', {'gameId': gameId}); //Sets name = express
            } else {
                console.log(track)
            }
        }
      });
    } else { 
      db.track.getTrackLink(req.params.id, (err,result) => {
        if (err) console.log(err);
        else {
          if (result) {
            track = result;
              // stocker track dans un cookies
              if (track) {
                  console.log(track);
                  res.cookie('track', track);
                  res.cookie('gameId', gameId);
                  res.render('difficulty', {'gameId': gameId}); //Sets name = express
              } else {
                  console.log(track)
              }
          } else {
            local = false;
            audio.getInfo(req.params.id, (err, result) => {
              if (err) console.log(err);
              else {
                audio.getYoutubeStream({
                  videoId: req.params.id,
                  quality: 'lowest'
                }, function (err, stream) {
                  if (err) console.log(err);
                  else {
                    audio.getAmplitudes(stream, barsPerSeconds, function (err, bars) {
                      if (err) console.log(err);
                      else {
                        var arraySpectrum = bars;
                        var arrayArtefacts = getArrayArthefacts(arraySpectrum); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
                        track_information = {
                          arraySpectrum: arraySpectrum,
                          arrayArtefacts: arrayArtefacts
                        };
                        var track = {
                          name: result.title,
                          link: req.params.id,
                          information: track_information
                        };
                        // add track to database 
                        db.track.create(track, function (err, result) {
                          if (err) console.log(err);
                          else {
                              track.id = result.id;
                              // stocker track dans un cookies
                              if (track) {
                                  console.log(track);
                                  res.cookie('track', track);
                                  res.cookie('gameId', gameId);
                                  res.render('difficulty', {'gameId': gameId}); //Sets name = express
                              } else {
                                  console.log(track)
                              }
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  });

module.exports = router
