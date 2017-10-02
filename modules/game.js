var gameFunctions = require('./game_function');
var io;
var gameSocket;
var game;

exports.initGame = function (sio, socket) {
  io = sio;
  gameSocket = socket;
  gameSocket.emit('connected', {
    message: "You are connected!"
  });

  // Host Events
  gameSocket.on('hostCreateNewGame', hostCreateNewGame);
  gameSocket.on('hostStartGame', hostStartGame);

  // Player Events
  gameSocket.on('playerMove', playerMove);
  gameSocket.on('gameOver', gameOver);
}

/*
 * The 'CREATE' button was clicked and 'hostCreateNewGame' event occurred.
 * Create the game 
 * @param data.youtubeVideoId The sound selected by the player
 * @param data.difficulty The difficulty selected by the player
 */
function hostCreateNewGame(data) {
  var youtubeVideoId  = data.youtubeVideoId;
  var difficulty      = data.difficulty;

  // Create a unique Socket.IO Room
  var thisGameId = (Math.random() * 100000) | 0;
  // Return the game to the browser client
  gameFunctions.createGame(data.youtubeVideoId, data.difficulty, thisGameId, this.id, function (error, game) {
    if (error) console.log(error);
    else this.emit('NewGameCreated', {
      game
    });
  });
  // Join the Room and wait for the players
  this.join(thisGameId.toString());
  var sock = this;
};

/*
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 * Launch the game 
 */
function hostStartGame() {
  console.log("Game starting");
  // peut être faire un wait avant de matter directement le son ? 
  var new_positions = setInterval(function () {
    get_new_position(function () {
      io.sockets.in(data.gameId).emit('energy', checkRightPosition(game, t));
    });
  }, 1000);
};

/*
 * The player has moved
 * Update the position of the player in the game object
 * @param data.position new position of the player
 */
function playerMove(data) {
  var position = data.position;
  
  game.position = position;
}

/*
 * The player finish or die.
 * Close the interval created before and sava date in database.
 */
function gameOver() {
  clearInterval(new_positions);
  // save du score ici pour la db
}