const youtube = require('./youtube');
const db = require('../models/controllers')
const util = require('util');
const logger = require('../utils/logger')(module);
const AudioContext = require('web-audio-api').AudioContext;
const SlowStream = require('slow-stream');
const arthefactCheckingLatency = 4000;
const context = new AudioContext();
var io;
var gameSocket;
var game;
var game_speed = 500;
var new_positions

module.exports.initGame = function (sio, socket) {
  logger.debug('Initilization of the game');
  io = sio;
  gameSocket = socket;
  gameSocket.emit('connected', {
    message: "You are connected!"
  });

  // Host Events
  gameSocket.on('hostCreateNewGame', hostCreateNewGame);
  gameSocket.on('hostStartGame', hostStartGame);

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
  var gameId = data.gameId;
  // Create a unique Socket.IO Room
  // Return the game to the browser client
  //createGame(data.youtubeVideoId, data.difficulty, thisGameId, this.id, function (err, gameCreate)
  createGame(youtubeVideoId, true, difficulty, gameId, this.id, function (err, gameCreate) {
    game = gameCreate
    if (err) logger.error(err);
    else {
      gameSocket.emit('newGameCreated', {
        game,
        latency: arthefactCheckingLatency
      })

      youtube.getAudioStream(youtubeVideoId, false, 'highest', (err, command) => {
        game.audioStreamPipe = command.pipe(new SlowStream({
          maxWriteInterval: 50
        }))

        game.audioStreamPipe.on('end', () => {
          io.sockets.in(game.gameId).emit('audioEnd')
        })

        game.audioStreamPipe.on('data', (chunk) => {
          io.sockets.in(game.gameId).emit('audioChunk', {
            chunk: chunk
          })
        })
      })
    }
  })

  // Join the Room and wait for the players
  gameSocket.join(gameId.toString())
};

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 * Launch the game, verify if the player finish the game or die during the game
 */
function hostStartGame() {
  logger.debug('Starting the game');

  // Player Events
  gameSocket.on('playerMove', playerMove);
  gameSocket.on('endGame', endGame);

  io.sockets.in(game.gameId).emit('gameStarted');

  setTimeout(function () {
    logger.debug("GO GO GO");
    currentBar = 0;
    new_positions = setInterval(function () {
      if (currentBar > game.arrayArtefacts.length) {
        endGame(true);
      } else if (game.energy == 0) {
        endGame(false);
      } else {
        data = checkRightPosition(game, currentBar);
        io.sockets.in(game.gameId).emit('energy', {
          data
        });
        currentBar++;
      }
    }, game_speed);
  }, arthefactCheckingLatency);
};

/**
 * The player has moved
 * Update the position of the player in the game object
 * @param {int} data.position new position of the player
 */
function playerMove(data) {
  //logger.debug(data);
  game.position = data.playerPosition;
}

/**
 * The player finish or die.
 * Close the interval created before and sava date in database.
 */
function endGame(victory) {
  clearInterval(new_positions);
  if (victory) victory = "victory";
  else victory = "loose";
  io.sockets.in(game.gameId).emit('onGameOver', {
    "result": victory,
    "score": game.nbArtefacts
  });
  // TODO : check UserId 
  score = {
    duration: game.currentBar,
    userId: 1, // int
    trackId: game.trackId
  };
  db.score.create(score, function (err, result) {
    if (err) logger.error(err);
  });
  gameSocket.disconnect(true);

  game.audioStreamPipe.pause()
  game.audioStreamPipe.destroy()

  logger.info('End of the game this is a ' + victory);
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
function createGame(sound, local, difficulty, gameId, socketId, callback) {
  logger.debug('Creation of the game object');
  // TODO : ajouter ici les morts des amis par rapport aux player
  db.track.getTrackName(sound, function (err, result) {
    if (err) logger.error(err);
    game = {
      gameId: gameId,
      socketId: socketId,
      position: 1, // here 0, 1, 2, 3 --- 0 upper and 3 lowest 
      currentBar: 0,
      difficulty: difficulty // difficulty of the level 
    };

    if (typeof result != 'undefined') { // Search if the sound exist
      game.arraySpectrum = result.information.arraySpectrum;
      game.arrayArtefacts = result.information.arrayArtefacts;
      game.energy = result.information.arraySpectrum.length; // duration of the music 
      game.track = result.id;
    }
    callback(null, game)
    logger.debug('Game created !')
  });


}


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
function checkRightPosition(game, currentBar) {
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
    energy: game.energy,
    isArtefactTaken: success,
    nbArtefacts: game.nbArtefacts,
    bar: currentBar
  };
  return data
}