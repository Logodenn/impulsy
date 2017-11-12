
// ******************** IO ******************** //

var IO = {

    init: function() {
        IO.socket = io.connect();
        IO.bindEvents();
        IO.onJoinRoom();
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
        IO.socket.on('gameJoined', IO.onGameJoined)
    },

    onGameJoined: function (data) {
        IO.nsocket = io.connect('/' + data.gameId)
        console.log('/' + data.gameId)

        IO.nsocket.on('gameStarted', IO.onGameStarted);
        IO.nsocket.on('playerMove', IO.onPlayerMove);
        IO.nsocket.on('energy', IO.onEnergy);
        IO.nsocket.on('gameOver', IO.onGameOver);
    },

    onConnected : function() {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.sessionid;
        // console.log(data.message);
    },

    onJoinRoom : function() {

        var data = {
            roomId: "I have no idea of what I'm doing"
        }
        console.log("join room");
        IO.nsocket.emit('joinRoom', data);
    },

    onNewGameCreated : function(data) {
		// gameId
		// mySocketId
        App.Host.gameInit(data);
    },

    onGameStarted : function(data) {
        startGame();
        // TODO: Change chunkPLayer and create a new chunkPlayer
        if (!chunkPlayer._startTime) {
            setTimeout(chunkPlayer._start, 4270);
        }
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

	onGameOver : function (data) {
		endGame(data);
		// TODO
		// Notify players that game has ended
		// remove listeners
    },
	onAudioChunk: function(data) {
        chunkPlayer._onAudioChunk(data.chunk);
    },
    onAudioEnd: function () {
        // This is when the audio data is fully sent
    }
};

IO.init();
