const express = require('express')
const RoomManager = require('../modules/RoomManager')
const router = express.Router()
const Spectrum = require('./Spectrum')

router.post('/', (req, res) => {
  const roomId = RoomManager.createRoom();
  Spectrum = new Spectrum();
  var trackId = parseInt(req.params.id);
  if (Number.isInteger(trackId)){
    // It's from our database
    Spectrum.loadSpectrum(result.id);
  }else{
    db.track.getTrackLink(req.params.id, (err,result) => {
      if (err) console.log(err);
      else {
        if (result) {
            Spectrum.loadSpectrum(result.id);
        } else {
          Spectrum.createSpectrum(trackId, false);
        }
      }
    });
  }
  
  res.redirect(`/room/${roomId}`);
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view
  

  res.render('game')
})

module.exports = router
