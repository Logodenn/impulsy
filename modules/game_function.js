var youtube = require('./youtube');
const logger = require('winston');
const ffmpeg = require('fluent-ffmpeg');


/**
 * Function checkRightPosition use to verify the position of the player each bar
 * energy level depend of the difficulty : 
 * crazy : loose arthefact (-2 energy) get arthefact (-1 energy)
 * easy : loose arthefact (-1 energy) get arthefact (energy no change)
 * lazy : no energy
 * @param {object} game game object contain the position of the player, the difficulty of the party and the array of arthefact 
 * @param {int} currentBar bar at this moment in the client side
 * 
 */
module.exports.checkRightPosition = function checkRightPosition(game, currentBar) {
	var success;
	if (game.position != game.arrayArtefacts[currentBar] && game.difficulty == "easy") {
		game.energy = game.energy - 1;
		success = false;
	} else if (game.position == game.arrayArtefacts[currentBar] && game.difficulty == "crazy") {
		game.energy = game.energy - 1;
		game.nbArtefacts = game.nbArtefacts + 1;
		success = true;
	} else if (game.position != game.arrayArtefacts[currentBar] && game.difficulty == "crazy") {
		game.energy = game.energy - 2;
		success = false;
	} else if (game.position == game.arrayArtefacts[currentBar] && game.difficulty == "easy") {
		game.energy = game.energy;
		game.nbArtefacts = game.nbArtefacts + 1;
		success = true;
	} else if (game.difficulty == "lazy" && game.position == game.arrayArtefacts[currentBar]) {
		logger.debug("Level lazy no energy");
		game.nbArtefacts = game.nbArtefacts + 1;
		success = true;
	} else if (game.difficulty == "lazy" && game.position != game.arrayArtefacts[currentBar]) {
		logger.debug("Level lazy no energy");
		success = false;
	} else {
		logger.error("Check the difficulty or the current bar something is going wrong");
	}

	logger.debug(game.energy);
	logger.debug(currentBar + '/' + game.arrayArtefacts.length);
	game.currentBar = currentBar;
	data = {
		energy : game.energy,
		arthefactTaken : success,
		bar : currentBar
	}
	return data
}

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
	youtube.getAudioStream(sound, local, function (err, stream) {
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