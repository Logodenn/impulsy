const youtube = require('./youtube');

module.exports = class Spectrum {
	constructor() {
		this.name = null // name of the sound 
		this.bars = []
		this.barsPerSeconds = 2 // Number of bars per seconds for youtube modules
	}

	// Sound : Youtube Id or title 
	// local : if youtube False else True 
	createSpectrum(sound, local) {
		youtube.getAudioStream(sound, local, "lowest", function (err, stream) {
			if (err) console.log(err);
			else {
				youtube.getBars(stream, barsPerSeconds, function (err, bars) {
					if (err) console.log(err);
					else {
						// TODO : call bar method
						/*
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
						*/
						// add track to database 
						db.track.create(track, function (err, result) {
							if (err) console.log(err);
						});
					}
				});
			}
		});
	}

	loadBars(idSound) {

	}
}



module.exports = class Bar {
	constructor() {
		this.id = null // number of the bar in this spectrum 
		this.amplitude = null
		this.slots = []
		this.artefacts = []
		this.positionPlayers = []
		//this.rand = null
	}

	isCurrentBar(Player) {

	}

	/**
	 * Function getArrayArthefacts generate the array of arthefact in function of the envelop of the sound
	 * Attention if barSize is less than one, the randomNumber generated can be less than 0
	 * We can change baseLowerBound and baseUpperBound to modify the base position 
	 * @param {array} arraySpectrum array of the spectrum generate by the sound
	 */
	// TODO : remake for one amplitude and one random Number
	getArrayArthefacts() {
		logger.debug('Generation of the array of arthefact');
		var randomNumbers = [];
		var baseLowerBound = 1
		var baseUpperBound = 2
		arraySpectrum.forEach(function (barSize) {
			var lowerBound = baseLowerBound - barSize;
			var upperBound = baseUpperBound + barSize;
			var randomNumber = Math.round(Math.random() * (upperBound - lowerBound) + lowerBound);
			// Yay! new random number
			randomNumbers.push(randomNumber);
		});
		return randomNumbers;
	}

}