const logger = require('../utils/logger')(module)
/**
 * Const for the artefact
 */
const NUMBER_OF_POSITIONS = 4
const AMPLITUDE_MAX = 1
const BASE_LOWER_BOUND = 1
const BASE_UPPPER_BOUND = 2
const MINIMUM_AMPLITUDE = 0.05
/**
 * Bar object it define a bar with the amplitude and its artefact 
 * @class
 * 
 */
module.exports = class Bar {
  constructor () {
    this.amplitude = null
    this.artefacts = [] // artefact position
  }

  /**
   * Check artefact for this bar
   * @function
   * @param {Player} player
   */
  checkArtefact (player) {
    if (this.artefacts[player.number] !== null) {
      if (this.artefacts[player.number] === player.position.y) {
        return true
      } else {
        return false
      }
    } else {
      return null
    }
  }

  /**
   * Function create generate an artefact in function of the amplitude of the sound
   * Attention if barSize is less than one, the randomNumber generated can be less than 0
   * We can change baseLowerBound and baseUpperBound to modify the base position
   * @function
   * @param {float} barAmplitude amplitude of the bar
   * @param {int} number position of the bar in this spectrum
   */
  create (barAmplitude, number) {
    logger.debug('Generation of the bar' + number + ' with amplitude = ' + barAmplitude)
    this.id = number
    this.amplitude = barAmplitude
    var lowerBound = BASE_LOWER_BOUND
    var upperBound = BASE_UPPPER_BOUND
    var limit = AMPLITUDE_MAX / (NUMBER_OF_POSITIONS / 2)
    /*
    Settings for bound
    Check if the amplitude is bigger than the limit
    if it's bigger the bar will have more postion
    */

    if (this.amplitude > MINIMUM_AMPLITUDE) {
      do {
        if (this.amplitude > limit) {
          limit += limit
          lowerBound--
          upperBound++
        } else {
          break
        }
      } while (limit <= AMPLITUDE_MAX)

      // Add first artefact for player 1
      this.artefacts.push(Math.round(Math.random() * (upperBound - lowerBound) + lowerBound))
      // Check if the two player haven't got the same artefact position
      var artefactPlayer2 = 0
      do {
        artefactPlayer2 = Math.round(Math.random() * (upperBound - lowerBound) + lowerBound)
      } while (this.artefacts[0] === artefactPlayer2)
      // Add second artefact for player 2
      this.artefacts.push(artefactPlayer2)
    } else {
      this.artefacts.push(null)
      this.artefacts.push(null)
    }
  }

  /**
   * Load information in param to add these à this bar
   * @function
   * @param amplitude - Amplitude for this bar
   * @param artefacts - Artefacts position for this bar
   */
  loadBar (amplitude, artefacts) {
    this.amplitude = amplitude
    this.artefacts = artefacts
  }
}
