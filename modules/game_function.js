var youtube = require('./youtube');
const logger = require('winston');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Function getArrayArthefacts generate the array of arthefact in function of the envelop of the sound
 * Attention if barSize is less than one, the randomNumber generated can be less than 0
 * We can change baseLowerBound and baseUpperBound to modify the base position 
 * @param {array} arraySpectrum array of the spectrum generate by the sound
 */
function getArrayArthefacts(arraySpectrum) {
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

/**
 * Function createGame create game object 
 * @param {string} sound string of the youtube video id or path to the sound
 * @param {boolean} local false if the sound is from youtube true otherwise
 * @param {string} difficulty difficulty chose by the player at the begining
 * @param {int} gameId id of the game (equevalent of the room use for the socket)
 * @param {string} socketId id of the socket
 * @param callback 
 */
module.exports.createGame = function createGame(sound, local, difficulty, gameId, socketId, callback) {
	logger.debug('Creation of the game object');
	// TODO : ajotuer ici les morts des amis par rapport aux player
	var game = {
		gameId: gameId,
		socketId: socketId,
		position: 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
		currentBar : 0,
		nbArtefacts : 0,
		difficulty: difficulty // difficulty of the level 
	};
	youtube.getAudioStream(sound, local, 'lowest', function (err, stream) {
		if (err) logger.error(err);
		else {
			youtube.getBars(stream, 1, function (err, bars) {
				if (err) logger.error(err);
				else {
					game.arraySpectrum = bars;
					game.arrayArtefacts = getArrayArthefacts(game.arraySpectrum); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
					game.energy = game.arraySpectrum.length; // duration of the music 
					logger.debug('Game created !')
					callback(null, game)
				}
			});
		}
	});
}