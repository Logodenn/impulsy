const express = require('express')
const RoomManager = require('../modules/RoomManager')
const router = express.Router()
const Spectrum = require('../modules/Spectrum')
const db = require('../models/controllers')

router.post('/', (req, res) => {
  const roomId = RoomManager.createRoom();
  var difficulty = req.body.difficulty
  var spectrum = new Spectrum();
  var trackId = parseInt(req.body.track);
  console.log(difficulty);
  console.log(trackId);
  console.log(req.body);
  if (Number.isInteger(trackId)){
    // It's from our database
    spectrum.loadSpectrum(result.id);
  }else{
    // It's from Youtube
    db.track.getTrackLink(req.params.id, (err,result) => {
      if (err) console.log(err);
      else {
        if (result) {
            // In our database
            spectrum.loadSpectrum(result.id);
        } else {
            // New sound
            spectrum.createSpectrum(trackId, false, (err, result)=>{
            if(err) console.log(err);
        });
        }
      }
    });
  }
  console.log('Fin post room/')
  console.log(spectrum);
  res.redirect(`/room/${roomId}`);
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view
  

  res.render('game')
})

module.exports = router
