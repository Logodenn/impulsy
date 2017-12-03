
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
        IO.socket.on('playerMove', IO.onPlayerMove);
        IO.socket.on('updateGame', IO.onUpdateGame);
        IO.socket.on('missedArtefact', IO.onMissedArtefact);
        IO.socket.on('gameOver', IO.onEndOfGame);
        IO.socket.on('audioChunk', IO.onAudioChunk);
        IO.socket.on('audioEnd', IO.onAudioEnd);

        if (data.gameMetadata.players.length == 2) {
            document.querySelector("#startGameButton").attributes.state.value = "passive";
            document.querySelector("#waitingRoomMessage").innerHTML = data.gameMetadata.players[0].name + " is waiting for you!";
        }
    },

    // ******************************************************* //
    // ******************** START EVENTS ******************** //
    // ***************************************************** //

    onNewPlayer: function(data) {
        console.log(data.name + " has joined the room");
        // TODO create a waiting/ready process
        // But for now start right away the game
        // Enable startGame button
        App.Players.push(data);
        document.querySelector("#startGameButton").attributes.state.value = "passive";
        document.querySelector("#waitingRoomMessage").innerHTML = data.name + " is waiting for you!";
    },

    startGame: function() {
        // console.log("Game starting");
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
        // Notify back that self moved
        // console.log("Player " + data.number + " has movedlayer moved to: " + data.position);
        IO.socket.emit('playerMove', data);		
    },

    onPlayerMove: function(data) {
        // Update canvas because one player (self or the other) has moved
        console.log("Player " + data.number + " has moved to: " + data.position);
        players[data.number].slot = data.position
        players[data.number].update();		
    },

    // ****************************************************** //
    // ******************** GAME EVENTS ******************** //
    // **************************************************** //

    onUpdateGame: function(data) {
        // console.log(data);
        App.Host.energy = data.energy;
        App.Player.takenArtefactsCount = data.takenArtefactsCount

        updateScore();
        updateGameScene(data);
    },

    onMissedArtefact: function(data) {
        // TODO
        // do something I DUNNO
    },
    
	onEndOfGame: function (data) {
        endGame(data);

        chunkPlayer._stop()
		// TODO
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
