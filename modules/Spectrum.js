const logger = require('../utils/logger')(module)
const audio = require('./audio')
const db = require('../models/controllers')
const Bar = require('./Bar')

const BAR_PER_SECONDS = 2

/**
 * Object Spectrum is the envelop of the sound
 * This object is made of bar
 * @class
 * @param {string} name name of the sound
 * @param {string} link link of the sound if is from Youtube
 * @param {array} bars array of Bar object
 * @param {int} barsPerSeconds int number of bar per second (speed of the song)
 */
module.exports = class Spectrum {
  constructor () {
    this.name = null // name of the sound
    this.link = null
    this.bars = [] // This is track information
    this.deathFlags = []
    this.artefactsToTakeCount = 0
  }

  /**
   * Function createSpectrum create the envelop of the sound
   * @function
   * @param {string} sound link or name of the sound
   * @param {bool} local False if is from Youtube, True if is from local storage
   */
  createSpectrum (sound, local, cb) {
    let getStream = audio.getYoutubeStream
    let self = this

    if (local) {
      getStream = audio.getLocalStream
      self.link = null
      self.name = sound
    }

    getStream({
      videoId: sound,
      fileName: sound,
      quality: 'lowest'
    }, function (err, stream) {
      if (err) {
        logger.error(err)
        return cb(err)
      } else {
        audio.getAmplitudes(stream, BAR_PER_SECONDS, function (err, barsAmplitude) {
          if (err) {
            logger.error(err)
            return cb(err)
          } else {
            for (let i in barsAmplitude) {
              let bar = new Bar()
              bar.create(barsAmplitude[i])
              self.bars.push(bar)
            }
            audio.getInfo(sound, (err, res) => {
              if (err) {
                logger.error(err)
              } else {
                self.link = res.id
                self.name = res.title
              }
              // add track to database
              const track = {
                name: self.name,
                link: self.link,
                information: self.bars
              }

              db.track.create(track, function (err, result) {
                if (err) {
                  console.log(err)
                  return cb(err)
                } else {
                  self.id = result.id
                  cb(null, self)
                }
              })
            })
          }
        })
      }
    })
  }

  /**
   * Function loadSpectrum load a spectrum from an id of a track
   * @function
   * @param {int} id id of a track
   * @param mode if it's a solo or coop game
   * @param cb callback
   */
  loadSpectrum (id, mode, cb) {
    const self = this
    var coop
    db.track.get(id, (err, result) => {
      if (err) logger.error(err)
      else {
        this.id = result.id
        this.name = result.name
        this.link = result.link

        this.bars = result.information.map(function (barJSON) {
          let bar = new Bar()
          bar.loadBar(barJSON.amplitude, barJSON.artefacts)

          if (barJSON.artefacts[0] !== null) {
            self.artefactsToTakeCount += 1
          }

          return bar
        })

        if (mode === 'solo') {
          coop = 0
        } else {
          coop = 1
        }

        db.score.meanScore(id, coop, (err, mean) => {
          if (err) logger.error(err)
          else {
            if (mean.length > 0) {
              this.deathFlags.push(mean[0])
            }

            db.score.bestScoresTrack(id, coop, (err, best) => {
              if (err) logger.error(err)
              else {
                if (best.length > 0) {
                  this.deathFlags.push(best[0])
                }

                cb(null, this)
              }
            })
          }
        })
      }
    })
  }
  /**
   * Function checkArtefacts use to check if the player take the artefact of the bar in params 
   * @function
   * @param {int} barNumber
   * @param {Player} player
   */
  checkArtefacts (barNumber, player) {
    return this.bars[barNumber].checkArtefact(player)
  }
}
