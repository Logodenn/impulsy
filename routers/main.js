const express = require('express');
const router = express.Router();
const db = require('../models/controllers');
var cookies = require( "cookies" )
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
    if (Number.isInteger(id))
    {
      // c'est dans notre base

    }
    else 
    {
      // c'est youtube  
    }
    // TODO : 
    // id ou youtube ? 
    // https://youtu.be/biYdUZXfz9I 
    // https://youtu.be/Y4uOM7s38XA
    // https://youtu.be/VgxDubF1TJA
    // Savoir si la musique existe 
    res.render('trackSelection');
  });
<div class="player">
      <iframe id="player" width="560" height="315" src="https://www.youtube.com/v/dQw4w9WgXcQ?autoplay=1&controls=1&disablekb=0&rel=0&enablejsapi=1" frameborder="0" allowfullscreen></iframe>
    </div>


module.exports = router;