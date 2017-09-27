var io = require('socket.io')(app);

var game_socket;

exports.init_game = function (sio, socket) {
  io = sio;
  game_socket = socket;
  game_socket.emit('connected', {
    message: "You are connected!"
  });

  // Host Events
  game_socket.on('host_create_new_game', host_create_new_game);
  // Player Events
  /*
    game_socket.on('playerJoinGame', playerJoinGame);
    game_socket.on('playerAnswer', playerAnswer);
	game_socket.on('playerRestart', playerRestart);
	*/
}

function check_right_position(game, t) {
  if ((game.position != game.artefact[t] & game.difficulty == "easy") | (game.position == game.artefact[t] & game.difficulty == "crazy")) game.energy = game.energy - 1
  else if (game.position != game.artefact[t] & game.difficulty == "crazy") game.energy = game.energy - 2
  else if (game.position == game.artefact[t] & game.difficulty == "easy") game.energy = game.energy
  else console.log("WTF !!!")
  return game.energy;
}

var game = {
  "position": 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
  "array_spectrum": new Array(), // array of 0 and 1 --- 0 : small and 1 big
  "array_artefacts": new Array(), // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
  "energy": 1000, // duration of the music 
  "difficulty": "crazy" // difficulty of the level 
};

// var array_spectrum = [0,0,0,1,1,0,1,0]; to test function below 

function get_random(array_spectrum) {
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

function host_create_new_game() {
  // Create a unique Socket.IO Room
  var thisGameId = (Math.random() * 100000) | 0;
  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  // utiliser socket id ? 
  this.emit('new_game_created', {
    gameId: thisGameId,
    mySocketId: this.id
  });
  this.emit('new_game', game)
  // Join the Room and wait for the players
  this.join(thisGameId.toString());
};

var new_positions = setInterval(function () {
  get_new_position(function (position) {
    game.position = position
    socket.volatile.emit('energy', check_right_position(game, t));
  });
}, 1000);

socket.on('death', function () {
  clearInterval(new_positions);
});