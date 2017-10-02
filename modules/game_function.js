var youtube = require('./youtube');



function checkRightPosition(game, t) {
	if ((game.position != game.artefact[t] & game.difficulty == "easy") | (game.position == game.artefact[t] & game.difficulty == "crazy")) game.energy = game.energy - 1
	else if (game.position != game.artefact[t] & game.difficulty == "crazy") game.energy = game.energy - 2
	else if (game.position == game.artefact[t] & game.difficulty == "easy") game.energy = game.energy
	else console.log("WTF !!!")
	return game.energy;
}



// var array_spectrum = [0,0,0,1,1,0,1,0]; to test function below 

function getRandom(array_spectrum) {
	//Example, including customisable intervals [lower_bound, upper_bound)
	var random_numbers = [];
	array_spectrum.forEach(function (element) {
		if (element == 0) {
			var lower_bound = 1;
			var upper_bound = 2;
		} else {
			var lower_bound = 0;
			var upper_bound = 3;
		}
		var random_number = Math.round(Math.random() * (upper_bound - lower_bound) + lower_bound);
		// Yay! new random number
		random_numbers.push(random_number);
	});
	return random_numbers;
}

function createGame(sound, difficulty, gameId, socketId, callback) {
	var game = {
		gameId: gameId,
		socketId: socketId,
		position: 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
		difficulty: difficulty // difficulty of the level 
	};
	youtube.getBars(sound, 1, function (erreur, bars) {
		if (erreur) console.log(erreur);
		else {
			game.array_spectrum = bars;
			game.array_artefacts = getRandom(game.array_spectrum); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
			game.energy = game.array_spectrum.length; // duration of the music 
			callback(null, game)
		}
	});
}