const audio = require('./audio')
const db = require('../models/controllers')
const Bar = require('./Bar')

const FREQUENCY_CHECKING = 10
const BAR_PER_SECONDS = 2


/**
 * Object Spectrum is the envelop of the sound
 * @attribute {string} name name of the sound 
 * @attribute {string} link link of the sound if is from Youtube 
 * @attribute {array} bars array of Bar object 
 * @attribute {int} barsPerSeconds int number of bar per second (speed of the song)
 */
module.exports = class Spectrum {
  constructor () {
    this.name = null // name of the sound
    this.link = null
    this.bars = [] // This is track information
    //this.barsPerSeconds = 2 // Number of bars per seconds for youtube modules
  }

  /**
   * Function createSpectrum create the envelop of the sound
   * @attribute {string} sound link or name of the sound
   * @attribute {bool} local False if is from Youtube, True if is from local storage
   */
  createSpectrum (sound, local, cb) {
    let getStream = audio.getYoutubeStream;
    let self = this;

    if (local) {
      getStream = audio.getLocalStream
    }
    audio.getInfo(sound, (err, res) =>{
      self.link = res.id;
      self.name = res.title;
      getStream({
        videoId: sound,
        fileName: sound,
        quality: 'lowest'
      }, function (err, stream) {
        if (err) {
          console.log(err);
          return cb(err)
        }
        else {
          audio.getAmplitudes(stream, BAR_PER_SECONDS, function (err, barsAmplitude) {
            if (err) {
              console.log(err);
              return cb(err)
            }
            else {
              barsAmplitude.forEach(function (barAmplitude, i) {
                let bar = new Bar();
                bar.create(barAmplitude, i);
                self.bars.push(bar);
              });
  
              // add track to database
              const track = {
                name: self.name,
                link: self.link,
                information: self.bars
              };
              db.track.create(track, function (err, result) {
                if (err) {
                  console.log(err);
                  return cb(err)
                }
                else {
                  self.id = result.id
                  cb(null, self)
                }
              })
            }
          })
        }
      })
    })

  }

  /**
   * Function loadSpectrum load a spectrum from an id of a track
   * @attribute {int} id id of a track
   */
  loadSpectrum (id, cb) {
    db.track.get(id, (err, result) => {
      if (err) console.log(err)
      else {
        this.name = result.name
        this.link = result.link
        this.bars= result.information.map(function(barJSON) {
          let bar = new Bar()
          bar.loadBar(barJSON.amplitude, barJSON.artefacts)
          return bar
        })
        cb(null, this)
      }
    })
  }
  
  checkArtefacts(barNumber, player)	{
    console.log(this.bars[barNumber]);
		return this.bars[barNumber].checkArtefact(player)
  }
  
}
