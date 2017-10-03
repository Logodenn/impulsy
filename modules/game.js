var gameFunctions = require('./game_function');
const logger = require('winston');
logger.level = 'debug';
var yt = require('./youtube');
var ss = require('socket.io-stream');
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
  gameSocket.on('endGame', endGame);

  // If the player Rage Quit or the player want to stop the level
  gameSocket.on('disconnect', function () {
    if (typeof timer != 'undefined') {
      logger.info("Close connection with socket : " + gameSocket.id);
      clearInterval(new_positions);
      gameSocket.disconnect(true)
    } else if (typeof game == 'undefined') {
      logger.info("Close connection with socket : " + gameSocket.id);
      gameSocket.disconnect(true)
    } else {
      logger.info("Close connection with socket : " + gameSocket.id + " room : " + game.gameId)
      endGame();
    }
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
  //gameFunctions.createGame(data.youtubeVideoId, data.difficulty, thisGameId, this.id, function (err, gameCreate)
  gameFunctions.createGame('./sounds/OrelSan - Basique.mp3', true, data.difficulty, thisGameId, this.id, function (err, gameCreate) {
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
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 * Launch the game, verify if the player finish the game or die during the game
 */
function hostStartGame() {
  logger.debug('Starting the game');
  io.sockets.in(game.gameId).emit('gameStarted');
  setTimeout(function(){
    console.debug("GO GO GO");
    currentBar = 0;
    new_positions = setInterval(function () {
      if (currentBar > game.arrayArtefacts.length) {
        endGame(true);
      } else if (game.energy == 0) {
        endGame(false);
      } else {
        const verificationEnergy = function (err, game, currentBar) {
          logger.debug('Verification of the energy for this bar : ' + currentBar);
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
          io.sockets.in(game.gameId).emit('energy', {
            energy: game.energy,
            touch: success
          });
        }
        currentBar++;
      }
    }, vitesse_game);
  }, 4000);

};

/**
 * The player has moved
 * Update the position of the player in the game object
 * @param {int} data.position new position of the player
 */
function playerMove(data) {
  game.position = data.position;
}

/**
 * The player finish or die.
 * Close the interval created before and sava date in database.
 */
function endGame(victory) {
  clearInterval(new_positions);
  if (victory) victory = "victory";
  else victory = "loose"
  io.sockets.in(game.gameId).emit('enfOfGame', {
    "result": victory,
    "score": game.nbArtefacts
  });
  // TODO : save du score ici pour la db
  gameSocket.disconnect(true)
  logger.info('End of the game this is a ' + victory)
}