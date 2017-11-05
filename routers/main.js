const express = require('express');
const router = express.Router();
const getArrayArthefacts = require('../utils/artefacts')
const db = require('../models/controllers');
var cookies = require("cookies")
const youtube = require('../modules/youtube');
const numberOfTrend = 10;
const numberOfUserMostPlayed = 10;
const numberOfUserFavorite = 10;
router
  .get("/", (req, res) => {
    res.render('index', {
      message: "Hello world !"
    });
  });

router
  .get('/hallOfFame', function (req, res) {
    res.render('hallOfFame', {
      message: "Hello World!"
    });
  });

router
  .get('/trackSelection', function (req, res) {
    // Most played tracks 
    db.track.getTrendTracks((err, trend) => {
      if (err) console.log(err);
      var data = {};
      data.trend = trend.slice(0, numberOfTrend);
      // User Most Played Tracks 
      if (req.user) {
        db.track.getUserMostPlayedTracks(req.user.id, (err, userMostPlayed) => {
          if (err) console.log(err);
          data.userMostPlayed = userMostPlayed.slice(0, numberOfUserMostPlayed);
          // Favorite User track
          req.user.getFavoriteTracks((err, userFavorite) => {
            if (err) console.log(err);
            data.userFavorite = userFavorite.slice(0, numberOfUserFavorite);
            data.userConnected = true;
            res.render('trackSelection', data);
          })
        })
      } else {
        data.userConnected = false;
        res.render('trackSelection', data);
      }
    })

  });

router
  .get('/difficulty/:id', function (req, res) {
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
                console.log(gameId);
                res.cookie('track', track);
                res.render('difficulty', {'gameId': gameId}); //Sets name = express
            } else {
                console.log(track)
            }
        }
      });
    } else {
      // It's from youtube  
      db.track.getTrackLink(req.params.id, (err,result) => {
        if (err) console.log(err);
        else {
          if (result) {
            track = result;
              // stocker track dans un cookies
              if (track) {
                  res.cookie('track', track);
                  res.render('difficulty', {'gameId': gameId}); //Sets name = express
              } else {
                  console.log(track)
              }
          } else {
            local = false;
            youtube.getInfo(req.params.id, (err, result) => {
              if (err) console.log(err);
              else {
                youtube.getAudioStream(req.params.id, local, "lowest", function (err, stream) {
                  if (err) console.log(err);
                  else {
                    youtube.getBars(stream, 1, function (err, bars) {
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
                                  res.cookie('track', track);
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

module.exports = router;