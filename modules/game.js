var gameFunctions = require('./game_function');
const logger = require('winston');
logger.level = 'debug';
var io;
var gameSocket;
var game;
var vitesse_game = 500; //vitesse du jeu
var new_positions

exports.initGame = function (sio, socket) {
  logger.debug('Initilization of the game');
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

  socket.on('disconnect', function(){
    logger.info("Clone connection with socket : "+gameSocket.id+" room : "+game.gameId);
    gameOver();
    gameSocket.disconnect(true)
  });
}

/**
 * The 'CREATE' button was clicked and 'hostCreateNewGame' event occurred.
 * Create the game 
 * @param data.youtubeVideoId The sound selected by the player
 * @param data.difficulty The difficulty selected by the player
 */
function hostCreateNewGame(data) {
  logger.debug('Creation of the game');  
  var youtubeVideoId = data.youtubeVideoId;
  var difficulty = data.difficulty;
  var gameCreate;
  // Create a unique Socket.IO Room
  var thisGameId = (Math.random() * 100000) | 0;
  // Return the game to the browser client
  gameFunctions.createGame(data.youtubeVideoId, data.difficulty, thisGameId, this.id, function (err, gameCreate) {
    game = gameCreate
    if (err) logger.error(err);
    else gameSocket.emit('newGameCreated', {
      game
    });
  });
  // Join the Room and wait for the players
  gameSocket.join(thisGameId.toString());
};

/**
 * Function verificationEnergy use every second when the game begining and checkRightPosition in order to update energy level of the player
 * @param {object} game game object contain the position of the player, the difficulty of the party and the array of arthefact 
 * @param {int} currentBar bar at this moment in the client side 
 */
function verificationEnergy (game, currentBar) {
  logger.debug('Verification of the energy for this bar : '+currentBar);
  io.sockets.in(game.gameId).emit('energy', gameFunctions.checkRightPosition(game, currentBar));
};

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 * Launch the game 
 */
function hostStartGame() {
  logger.debug('Starting the game');
  // peut être faire un wait avant de matter directement le son ? 
  io.sockets.in(game.gameId).emit('GameStarted');
  currentBar = 0
  new_positions = setInterval(function () {
    verificationEnergy(game, currentBar)
    currentBar = currentBar + 1;
  }, vitesse_game);
};

/**
 * The player has moved
 * Update the position of the player in the game object
 * @param {int} data.position new position of the player
 */
function playerMove(data) {
  var position = data.position;
  game.position = position;
}

/**
 * The player finish or die.
 * Close the interval created before and sava date in database.
 */
function gameOver() {
  clearInterval(new_positions);
  io.sockets.in(game.gameId).emit('enfOfGame');
  // save du score ici pour la db
}

