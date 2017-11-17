const express = require('express')
const RoomManager = require('../modules/RoomManager')
const router = express.Router()
const Spectrum = require('./Spectrum')

router.post('/', (req, res) => {
  const roomId = RoomManager.createRoom()

  res.redirect(`/room/${roomId}`)
})

router.get('/:id', (req, res) => {
  // TODO: Get the room data and send it to the view
  Spectrum = new Spectrum()

  res.render('game')
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
