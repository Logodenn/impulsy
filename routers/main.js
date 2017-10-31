const express = require('express');
const router = express.Router();
const db = require('../models/controllers');

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
  .get('/game/:id', function (req, res) {
    res.render('game', {
      mostPlayed: req.params.id
    });
  });



module.exports = router;