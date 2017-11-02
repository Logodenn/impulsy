const express = require('express');
const router = express.Router();
const db = require('../models/controllers');
var cookies = require( "cookies" )
const youtube = require('./youtube');
const numberOfTrend = 10;
const numberOfUserMostPlayed = 10;
const numberOfUserFavorite = 10;
router
.get("/", (req, res) => {
    res.render('index', { message : "Hello world !"});
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
        }
        else{
          data.userConnected = false;
          res.render('trackSelection', data);
        }
    })

  });

router
  .get('/trackSelection/:id', function (req, res) {
    var track;
    if (Number.isInteger(req.params.id))
    {
      // c'est dans notre base
      db.track.get(req.params.id, (err, result)=> {
          if (err) console.log(err);
          else track = result; 
      })
    }
    else 
    {
      // c'est youtube  
      // Savoir si la musique existe 
      // ajouter à la bdd 
      // méthode de Pierre pour récupérer 
      // ici local à false
      youtube.getAudioStream(soundName, local, "lowest", function (err, stream) {
        if (err) logger.error(err);
        else {
          youtube.getBars(stream, 1, function (err, bars) {
            if (err) logger.error(err);
            else {
              var arraySpectrum = bars;
              // On fou ou le getArrayArthefacts ?
              var arrayArtefacts = getArrayArthefacts(arraySpectrum); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
              track_information = {
                arraySpectrum: arraySpectrum,
                arrayArtefacts: arrayArtefacts
              };
              track = {
                name: soundName,
                link: req.params.id,
                information: track_information
              };
              db.track.create(track, function (err, result) {
                if (err) logger.error(err);
                //else game.trackId = result.trackId;
              });
              logger.debug('Track saved !')

            }
          });
        }
      });

    }
    // stocker track dans un cookies 

    res.render('trackSelection');
  });
<<<<<<< HEAD
 
=======

>>>>>>> ed0243149b26bd2c0d09d4c39c3b336c1cb9e082

module.exports = router;