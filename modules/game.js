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

  // Player Events
  gameSocket.on('playerMove', playerMove);
}

/*
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 * Create the game 
 * @param sound The sound selected by the player
 * @param difficulty The difficulty selected by the player
 */
function hostCreateNewGame(youtubeVideoId, difficulty) {
  // Create a unique Socket.IO Room
  var thisGameId = (Math.random() * 100000) | 0;
  // Return the game to the browser client
  createGame(youtubeVideoId, difficulty, thisGameId, this.id, function (error, game) {
    if (error) console.log(error);
    else this.emit('NewGameCreated', {
      game
    });
  });
  // Join the Room and wait for the players
  this.join(thisGameId.toString());
  var sock = this;
};


function playerMove(position) {    
  game.position = position;
}



/**
 * TODO : voir t qui est envoyé par client ça devrait être géré ici 
 * Partie pour vérifier toute les secondes la position du joueur par rapport à l'arthéfact 
 * A revoir il y a surement des bugs
 */
// var new_positions = setInterval(function () {
//   get_new_position(function () {
//     io.sockets.in(data.gameId).emit('energy', checkRightPosition(game, t));
//   });
// }, 1000);

// socket.on('death', function () {
//   clearInterval(new_positions);
// });