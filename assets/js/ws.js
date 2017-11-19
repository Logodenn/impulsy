
// ******************** IO ******************** //

var IO = {

    /* Events which emit to back are :
    ** connection(clientSocket)
    ** joinRoom(roomId)
    ** startGame()
    ** playerMove(player)
    */

    // ******************** WS INITIALIZATION ******************** //
    init: function() {
        IO.socket = io.connect();
        IO.bindEvents();
        IO.joinRoom();
    },
    bindEvents : function() {
        IO.socket.on('connected', IO.onConnected);
        IO.socket.on('roomJoined', IO.onRoomJoined);
        //When a new player join the room all players of this room receive the data of this new player.
        //Event : newPlayer
        //IO.socket.on('newPlayer', IO.onRoomJoined);
    },
    // ******************** CONNECTION EVENTS ******************** //
    onConnected : function() {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.sessionid;
    },
    connection: function() {
        var data = {
            sessionId: App.mySocketId
        }
        console.log("connection: session " + data.sessionId);
        IO.socket.emit('joinRoom', data);
    },
    // ******************** ROOM EVENTS ******************** //
    joinRoom : function() {
        // TODO: we might want to add the sessionId (fro the cookie) to be able to authenticate the user in the back
        var data = {
            roomId: window.location.pathname.split('/')[2] // window.location.path vaut '/room/{roomId}'
        }
        console.log("joinRoom: room " + data.roomId);
        IO.socket.emit('joinRoom', data);
    },
    onRoomJoined: function (data) {
        // This is where we have to setup game events listeners
        console.log('Successfully joined room ' + data.roomId);

        IO.socket.on('gameMetadata', IO.onGameMetadata);
        IO.socket.on('gameStarted', IO.onGameStarted);
        IO.socket.on('playerMove', IO.onPlayerMove);
        IO.socket.on('updateGame', IO.onUpdateGame);
        IO.socket.on('gameOver', IO.onGameOver);
		IO.socket.on('audioChunk', IO.onAudioChunk);
        IO.socket.on('audioEnd', IO.onAudioEnd);
    },
    // ******************** START EVENTS ******************** //
    startGame : function() {
        console.log("game starting");
        IO.socket.emit('startGame', null);
    },
    onGameMetadata : function(data) {
        console.log('onMetadata: ', data)

        App.Host.gameInit(data);
    },
    onGameStarted : function(data) {
        startGame();
        // TODO: Change chunkPLayer and create a new chunkPlayer
        if (!chunkPlayer._startTime) {
            setTimeout(chunkPlayer._start, 4270);
        }
    },
    // ******************** GAME EVENTS ******************** //
    playerMove : function(data) {
        console.log("player " + data.number + " moved to: " + data.position);
        IO.socket.emit('playerMove', data);
		player.update();		
    },
    onCoopMove : function(data) {
        // TODO notify self that the other player has moved
        // if(data.number != yourself) {
            player.update();		
        // }
    },    
    onUpdateGame : function(data) {
        // TODO
        updateGameScene(data);
	},
	onGameOver : function (data) {
		endGame(data);
		// TODO
		// Notify players that game has ended
		// remove listeners
    },
    // ******************** AUDIO EVENTS ******************** //
	onAudioChunk: function(data) {
        chunkPlayer._onAudioChunk(data.chunk);
    },
    onAudioEnd: function () {
        // This is when the audio data is fully sent
    }
};

IO.init();
