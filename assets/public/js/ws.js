
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
    isBinded : false,

    /**
     * Connect to the socket and initialize the join-room process
     * @function
     */
    init: function() {
        IO.socket = io.connect();
        IO.bindEvents();
        IO.joinRoom();
    },

    /**
     * Bind socket events
     * @function
     */
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

    /**
     * Store the sessionId
     * @function
     */
    onConnected : function() {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.sessionid;
        console.log("onConnected");
    },

    // ****************************************************** //
    // ******************** ROOM EVENTS ******************** //
    // **************************************************** //

    /**
     * Notify the server that the web client wants to join the room
     * @function
     */
    joinRoom : function() {
        // TODO: we might want to add the sessionId (from the cookie) to be able to authenticate the user in the back
        var data = {
            roomId: window.location.pathname.split('/')[2] // window.location.path vaut '/room/{roomId}'
        }
        console.log("joinRoom: room " + data.roomId);
        IO.socket.emit('joinRoom', data);
    },

    /**
     * Initialize the game and its WS events
     * @function
     * @param {*} data 
     */
    onRoomJoined: function (data) {
        // This is where we have to setup game events listeners
        console.log('Successfully joined room ' + data.roomId);

        // console.log('Game metadata is: ', data);
        App.Host.gameInit(data);

        if (!IO.isBinded) {
            IO.socket.on('newPlayer', IO.onNewPlayer);
            IO.socket.on('gameStarted', IO.onGameStarted);
            IO.socket.on('playerMove', IO.onPlayerMove);
            IO.socket.on('updateGame', IO.onUpdateGame);
            IO.socket.on('missedArtefact', IO.onMissedArtefact);
            IO.socket.on('gameOver', IO.onEndOfGame);
            IO.socket.on('audioChunk', IO.onAudioChunk);
            IO.socket.on('audioEnd', IO.onAudioEnd);
            IO.socket.on('playerDisconnected', IO.onPlayerDisconnected);

            IO.isBinded = true
        }

        // If coop, wait for the other player
        if (data.gameMetadata.players.length == 2) {
            document.querySelector("#startGameButton").attributes.state.value = "passive";
            document.querySelector("#waitingRoomMessage").innerHTML = data.gameMetadata.players[0].name + " is waiting for you!";
        }
    },

    // ******************************************************* //
    // ******************** START EVENTS ******************** //
    // ***************************************************** //

    /**
     * Initialize the game and its WS events
     * @function
     * @param {*} data 
     */
    onNewPlayer: function(data) {
        console.log(data.name + " has joined the room");
        // Enable startGame button
        App.Players.push(data);
        document.querySelector("#startGameButton").attributes.state.value = "passive";
        document.querySelector("#waitingRoomMessage").innerHTML = data.name + " is waiting for you!";
    },

    /**
     * Stop the game and the music chunk player
     * @function
     */
    onPlayerDisconnected: function () {
        document.querySelector("#startGameButton").attributes.state.value = "disabled";
        document.querySelector("#waitingRoomMessage").innerHTML = "Waiting for another player...";

        if(document.querySelector("canvas")) {
            // Game exists so it must be stopped
            document.querySelector("#disconnectedUserLayer").classList.remove("hidden");
            // endGame(data);
            chunkPlayer._stop()
        }
    },

    /**
     * Notify the server that the player as clicked the start game button
     * @function
     */
    startGame: function() {
        // console.log("Game starting");
        IO.socket.emit('startGame');
    },

    /**
     * Start the game and the audio chunk player
     * @function
     * @param {*} data 
     */
    onGameStarted: function(data) {
        // TODO start countdown
        // startCountdown()
        resetGame();
        startGame();
        // TODO: Change chunkPLayer and create a new chunkPlayer
        if (!chunkPlayer._startTime) {
            chunkPlayer._stop()
            setTimeout(chunkPlayer._start, 4270);
        }
    },

    /**
     * Notify the server that the player has clicked the play again button
     * @function
     * @param {*} data 
     */
    playAgain: function(data) {
        IO.socket.emit('playAgain', data)
    },

    // ******************************************************** //
    // ******************** PLAYER EVENTS ******************** //
    // ****************************************************** //

    /**
     * Notify the server that the player has moved
     * @function
     * @param {*} data 
     */
    playerMove: function(data) {
        // Notify back that self moved
        // console.log("Player " + data.number + " has movedlayer moved to: " + data.position);
        IO.socket.emit('playerMove', data);
    },

    /**
     * Update the canvas when a player moves
     * @function
     * @param {*} data 
     */
    onPlayerMove: function(data) {
        // Update canvas because one player (self or the other) has moved
        console.log("Player " + data.number + " has moved to: x->" + data.x + " y-->" + data.y);
        players[data.number].y = data.y
        players[data.number].x = data.x
        players[data.number].update();
    },

    // ****************************************************** //
    // ******************** GAME EVENTS ******************** //
    // **************************************************** //

    /**
     * Update the score and the canvas
     * @function
     * @param {*} data 
     */
    onUpdateGame: function(data) {
        // console.log(data);
        App.Host.energy = data.energy;
        App.Player.takenArtefactsCount = data.takenArtefactsCount

        updateScore();
        updateGameScene(data);
    },

    onMissedArtefact: function(data) {},
    
    /**
     * End the game and stop the audio chunk player
     * @function
     * @param {*} data 
     */
	onEndOfGame: function (data) {
        endGame(data);

        chunkPlayer._stop()
		// remove listeners
    },

    // ******************************************************* //
    // ******************** AUDIO EVENTS ******************** //
    // ***************************************************** //

    /**
     * Add the audio chunk
     * @function
     * @param {*} data 
     */
	onAudioChunk: function(data) {
        chunkPlayer._onAudioChunk(data.chunk);
    },

    onAudioEnd: function () {
        // This is when the audio data is fully sent
    }
};

IO.init();
