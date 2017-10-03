var youtube = require('./youtube');
const logger = require('winston');

/**
 * Function checkRightPosition use to verify the position of the player each bar
 * energy level depend of the difficulty : 
 * crazy : loose arthefact (-2 energy) get arthefact (-1 energy)
 * easy : loose arthefact (-1 energy) get arthefact (energy no change)
 * lazy : no energy
 * @param {object} game game object contain the position of the player, the difficulty of the party and the array of arthefact 
 * @param {int} currentBar bar at this moment in the client side
 */
module.exports.checkRightPosition = function checkRightPosition(game, currentBar) {
	logger.debug('Check the position of the player');
	logger.debug('Player : '+game.position);	
	logger.debug('Arthefact : '+game.arrayArtefacts[currentBar]);		
	if ((game.position != game.arrayArtefacts[currentBar] && game.difficulty == "easy") || (game.position == game.arrayArtefacts[currentBar] && game.difficulty == "crazy")){
		game.energy = game.energy - 1
	} 
	else if (game.position != game.arrayArtefacts[currentBar] && game.difficulty == "crazy"){ 
		game.energy = game.energy - 2
	} 
	else if (game.position == game.arrayArtefacts[currentBar] && game.difficulty == "easy"){
		game.energy = game.energy
	} 
	else if (game.difficulty == "lazy"){
		logger.debug("Level lazy no energy");
	} 
	else {
		logger.error("Check the difficulty or the current bar something is going wrong");
	}
	logger.debug('Energy of the player : '+game.energy)
	return game.energy;
}

/**
 * Function getArrayArthefacts generate the array of arthefact in function of the envelop of the sound
 * @param {array} arraySpectrum array of the spectrum generate by the sound
 */
function getArrayArthefacts(arraySpectrum) {
	logger.debug('Generation of the array of arthefact');		
	var randomNumbers = [];
	arraySpectrum.forEach(function (element) {
		if (element == 0) {
			var lowerBound = 1;
			var upperBound = 2;
		} else {
			var lowerBound = 0;
			var upperBound = 3;
		}
		var randomNumber = Math.round(Math.random() * (upperBound - lowerBound) + lowerBound);
		// Yay! new random number
		randomNumbers.push(randomNumber);
	});
	return randomNumbers;
}

/**
 * Function createGame create game object 
 * @param {string} youtubeVideoId string of the youtube video id
 * @param {string} difficulty difficulty chose by the player at the begining
 * @param {int} gameId id of the game (equevalent of the room use for the socket)
 * @param {string} socketId id of the socket
 * @param callback 
 */
module.exports.createGame = function createGame(youtubeVideoId, difficulty, gameId, socketId, callback) {
	logger.debug('Creation of the game object');		
	var game = {
		gameId: gameId,
		socketId: socketId,
		position: 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
		difficulty: difficulty // difficulty of the level 
	};
	youtube.getAudioStream(youtubeVideoId, function (err, stream) {
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