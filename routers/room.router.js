const express = require('express')
const RoomManager = require('../modules/RoomManager')
const router = express.Router()
const Spectrum = require('../modules/Spectrum')
const db = require('../models/controllers')

router.post('/', (req, res) => {
  var difficulty = req.body.difficulty
  var spectrum = new Spectrum();
  var trackId = parseInt(req.body.track);
  var roomId;
  if (Number.isInteger(trackId)){
    // It's from our database
    roomId = RoomManager.createRoom(trackId);
    res.redirect(`/room/${roomId}`);
    console.log(RoomManager.rooms);
  }else{
    // It's from Youtube
    db.track.getTrackLink(req.params.id, (err,result) => {
      if (err) console.log(err);
      else {
        if (result) {
            // In our database
            roomId = RoomManager.createRoom(trackId);
            res.redirect(`/room/${roomId}`);
        } else {
            // New sound
            var spectrum = new Spectrum();
            spectrum.createSpectrum(trackId, false, (err, result)=>{
            if(err) console.log(err);
            else{
              roomId = RoomManager.createRoom(trackId);
              res.redirect(`/room/${roomId}`);
            } 
        });
        }
      }
    });
  }
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view
  

  res.render('game')
})

module.exports = router
