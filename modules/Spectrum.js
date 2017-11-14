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



module.exports = class Bar {
	constructor() {
		this.id = null // number of the bar in this spectrum 
		this.amplitude = null
		this.artefacts = [] // artefact position 
		this.positionPlayers = []
		this.isCurrentBar = false;
		//this.rand = null
	}

	// *
	// * READ THIS
	// * there is a masterInterval and a currentBarId global va
	// * every n sec of the masterInterval, the currentBarId++
	// * That way, everytime onMove AND onCurrentBar++ (those two events embrace the checking)
	// * we call spectrum.bars[currentBarId].checkArtefact();
	// *
	// * END READ THIS
	// *

	currentBar(Player) {

		if(this.isCurrentBar) {

			currentBarInterval = setInterval(function () {
				
				// TODO enable checking
	
			}, FREQUENCY_CHECKING); // TODO check for a perfect refresh value
		} else {
			if(currentBarInterval) {
				clearInterval(currentBarInterval);
			}
		}
		
	}

	checkArtefact(Player) {
		// Called on player move or on isCurrentBar timer start
		if(artefacts[Player.id] == Player.position) {
			// Artefact taken
			// TODO notify listeners

			

			// TODO close interval as the artefact is taken - no need for further checks
			// TODO clear if exists
			clearInterval(currentBarInterval);
		}

	}

	/**
	 * Function create generate an artefact in function of the amplitude of the sound
	 * Attention if barSize is less than one, the randomNumber generated can be less than 0
	 * We can change baseLowerBound and baseUpperBound to modify the base position 
	 * @param {float} barAmplitude amplitude of the bar
	 * @param {int} number position of the bar in this spectrum
	 */
	create(barAmplitude, number) {
		console.log("Generation of the bar"+number+" with amplitude = "+barAmplitude);
		this.id = number;
		this.amplitude = barAmplitude;
		var lowerBound = BASE_LOWER_BOUND;
		var upperBound = BASE_UPPPER_BOUND;
		var limit = AMPLITUDE_MAX / (NUMBER_OF_POSITIONS/2);
		/*
			Settings for bound
			Check if the amplitude is bigger than the limit 
			if it's bigger the bar will have more postion 
		*/
		/*
		if (this.amplitude < MINIMUM_AMPLITUDE)
		{
		*/
			do {
				if(this.amplitude>limit){
					limit+=limit;
					lowerBound--;
					upperBound++;
				}
				else{
					break;
				}
			} while (limit <= AMPLITUDE_MAX);

			// Add first artefact for player 1
			this.artefacts.append(Math.round(Math.random() * (upperBound - lowerBound) + lowerBound));
			// Check if the two player haven't got the same artefact position
			var artefactPlayer2 = 0
			do{
				artefactPlayer2 = Math.round(Math.random() * (upperBound - lowerBound) + lowerBound)
				
			}while (this.artefacts[0] == artefactPlayer2);
			// Add second artefact for player 2
			this.artefacts.append(artefactPlayer2);
		/*
		}
		else {
			this.artefacts.append(null);
			this.artefacts.append(null);
		}
		*/
	}

}