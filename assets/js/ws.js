
// ******************** IO ******************** //

var IO = {

    init: function() {
        IO.socket = io.connect();
        IO.bindEvents();
    },

    bindEvents : function() {
        IO.socket.on('connected', IO.onConnected);
        IO.socket.on('newGameCreated', IO.onNewGameCreated);
        IO.socket.on('gameStarted', IO.onGameStarted);
        IO.socket.on('playerMove', IO.onPlayerMove);
        IO.socket.on('energy', IO.onEnergy);
        IO.socket.on('gameOver', IO.onGameOver);
		IO.socket.on('audioChunk', IO.onAudioChunk);
		IO.socket.on('audioEnd', IO.onAudioEnd);
    },

    onConnected : function() {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.sessionid;
        // console.log(data.message);
    },

    onNewGameCreated : function(data) {
		// gameId
		// mySocketId
        App.Host.gameInit(data);
    },

    onGameStarted : function(data) {
        startGame(); // TODO Game.startGame()
    },

    onPlayerMove : function(data) {
		// TODO
		// Notify players that a player has moved
		player.update();		
    },
    
    onEnergy : function(data) {
        // TODO
        updateGameScene(data);
	},

	gameOver : function (data) {
		endGame();
		// TODO
		// Notify players that game has ended
		// remove listeners
    },
	onAudioChunk: function(data) {
        chunkPlayer._onAudioChunk(data.chunk);

        if (!chunkPlayer._startTime) {
            chunkPlayer._start();
        }
    },
    onAudioEnd: function () {
        clearInterval(chunkPlayer._timer);
    }
};

IO.init();