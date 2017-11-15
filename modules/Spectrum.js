const youtube = require('./youtube');
const db = require('../models/controllers');
const FREQUENCY_CHECKING = 10;
/**
 * Const for the artefact 
 */
const NUMBER_OF_POSITIONS = 4;
const AMPLITUDE_MAX = 1;
const BASE_LOWER_BOUND = 1;
const BASE_UPPPER_BOUND = 2;
const MINIMUM_AMPLITUDE = 0.05;

/**
 * Object Spectrum is the envelop of the sound
 * @attribute {string} name name of the sound 
 * @attribute {string} link link of the sound if is from Youtube 
 * @attribute {array} bars array of Bar object 
 * @attribute {int} barsPerSeconds int number of bar per second (speed of the song)
 */
module.exports = class Spectrum {
	constructor() {
		this.name = null // name of the sound 
		this.link = null
		this.bars = [] // This is track information
		this.barsPerSeconds = 2 // Number of bars per seconds for youtube modules
	}

	/**
	 * Function createSpectrum create the envelop of the sound
	 * @attribute {string} sound link or name of the sound
	 * @attribute {bool} local False if is from Youtube, True if is from local storage
	 */
	createSpectrum(sound, local) {
		youtube.getAudioStream(sound, local, "lowest", function (err, stream) {
			if (err) console.log(err);
			else {
				youtube.getBars(stream, barsPerSeconds, function (err, barsAmplitude) {
					if (err) console.log(err);
					else {
						var i = 0
						barsAmplitude.forEach(function (barAmplitude) {
							bar = new Bar();
							bar.create(barAmplitude,i);
							this.bars.append(bar);
							i++;
						});
						// add track to database 
						var track = {
							name: this.name,
							link: this.link,
							information: this.bars
						};
						db.track.create(track, function (err, result) {
							if (err) console.log(err);
						});
					}
				});
			}
		});
	}

	/**
	 * Function loadSpectrum load a spectrum from an id of a track
	 * @attribute {int} id id of a track
	 */
	loadSpectrum(id) {
		db.track.get(id, (err, result) => {
			if (err) console.log(err); 
			else {
				track = result;
				this.name = result.name;
				this.link = result.link;
				this.bars = result.information;
			}
		});
	}
}