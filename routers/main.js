const express = require('express');
const router = express.Router();
const db = require('../models/controllers');

const numberOfMostPlayed = 10;
const numberOfUserMostPlayed = 10;

router
  .get("/", (req, res) => {
    res.render('index', {
      message: 'Hello World'
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
    // Trend track --> Youtube ? 
    // Most played tracks 
    db.track.getMostPlayedTracks((err, mostPlayed) => {
      if (err) console.log(err);
      var data;
      data.mostPlayed = mostPlayed.slice(0, numberOfMostPlayed);
      // User Most Played Tracks 
      // check UserID
      db.track.getUserMostPlayedTracks(1, (err, userMostPlayed) => {
        if (err) console.log(err);
        data.userMostPlayed = userMostPlayed.slice(0, numberOfUserMostPlayed);
        
        // Favorite track --> player connected ? 
        // db.user.getFavoriteTracks --> fav du user (avec l'objet entier)
        res.render('trackSelection', data);
      })
      
    })
    
  });

router
  .get('/game/:id', function (req, res) {
    res.render('game', {mostPlayed : req.params.id});
  });



module.exports = router;