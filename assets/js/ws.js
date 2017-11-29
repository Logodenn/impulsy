
// ******************** IO ******************** //

var IO = {

    /* Events which emit to back are :
    ** connection(clientSocket)
    ** joinRoom(roomId)
    ** startGame()
    ** playerMove(player)
    */

    // ************************************************************ //
    // ******************** WS INITIALIZATION ******************** //
    // ********************************************************** //

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

    // ************************************************************ //
    // ******************** CONNECTION EVENTS ******************** //
    // ********************************************************** //

    onConnected : function() {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.sessionid;
        console.log("onConnected");
    },

    // ****************************************************** //
    // ******************** ROOM EVENTS ******************** //
    // **************************************************** //

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

        // TODO recieve gameMetada
        // console.log('Game metadata is: ', data);
        App.Host.gameInit(data);

        IO.socket.on('newPlayer', IO.onNewPlayer);
        IO.socket.on('gameStarted', IO.onGameStarted);
        IO.socket.on('coopMove', IO.onCoopMove);
        IO.socket.on('updateGame', IO.onUpdateGame);
        IO.socket.on('missedArtefact', IO.onMissedArtefact);
        IO.socket.on('endOfGame', IO.onEndOfGame);
        IO.socket.on('audioChunk', IO.onAudioChunk);
        IO.socket.on('audioEnd', IO.onAudioEnd);
    },

    // ******************************************************* //
    // ******************** START EVENTS ******************** //
    // ***************************************************** //

    onNewPlayer: function(data) {
        console.log(data + " has joined the room");
        // console.log(data);
    },

    startGame: function() {
        console.log("Game starting");
        // IO.socket.emit('startGame', null);
        IO.socket.emit('startGame');
    },

    onGameStarted: function(data) {
        // TODO start countdown
        // startCountdown()
        startGame();
        // TODO: Change chunkPLayer and create a new chunkPlayer
        if (!chunkPlayer._startTime) {
            setTimeout(chunkPlayer._start, 4270);
        }
    },

    // ******************************************************** //
    // ******************** PLAYER EVENTS ******************** //
    // ****************************************************** //

    playerMove: function(data) {
        // console.log("player " + data.number + " moved to: " + data.position);
        console.log("player moved to: " + data);
        IO.socket.emit('playerMove', data);		
    },

    onCoopMove: function(data) {
        // TODO notify self that the other player has moved
        // if(data.number != yourself) {
            player.update();		
        // }
    },

    // ****************************************************** //
    // ******************** GAME EVENTS ******************** //
    // **************************************************** //

    onUpdateGame: function(data) {
        // TODO
        updateGameScene(data);
    },

    onMissedArtefact: function(data) {
        // TODO
        // do something I DUNNO
    },
    
	onEndOfGame: function (data) {
        endGame(data);
		// TODO
		// Notify players that game has ended
		// remove listeners
    },

    // ******************************************************* //
    // ******************** AUDIO EVENTS ******************** //
    // ***************************************************** //

	onAudioChunk: function(data) {
        chunkPlayer._onAudioChunk(data.chunk);
    },

    onAudioEnd: function () {
        // This is when the audio data is fully sent
    }
};

IO.init();
