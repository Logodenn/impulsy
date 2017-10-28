// var model = {
// 	gameName	: "Impulsy",
// 	catchPhrase	: "Ride the music!"
// }

/*var context = {gameName: "Impulsy", catchPhrase: "Ride the music!"};
var html    = template(context);*/

// *********************************************************************************************************** //
// **************************************** WEBSOCKET INITIALIZATION **************************************** //
// ********************************************************************************************************* //

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
		startGame();
		// TODO
    },

    onPlayerMove : function(data) {
		// TODO
		// Notify players that a player has moved
		player.update();		
    },
    
    onEnergy : function(data) {

        var gameState = data.data; // Dirty, back should send data, not data.data
        // gameState is so : { energy: 163, isArtefactTaken: false, nbArtefacts: null, bar: 31 }

        // Handle energy
        energyBar.width = gameState.energy;
        energyBar.update();

        // Handle artefact checking
        if(gameState.isArtefactTaken) {
            App.Player.artefactsTaken.push(App.Player.artefactsToTake[gameState.bar]);
            console.log("Nb of taken artefact : " + App.Player.artefactsTaken.length);
            // console.log(listeArtefacts); cote Thomas
            listeArtefacts[gameState.bar].img.src = "../img/artefactTaken.png";
        }
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

// ******************** App ******************** //

var App = {

    gameId: 0,
    myRole: '',   // 'Player' or 'Host'

    /**
     * The Socket.IO socket object identifier. This is unique for
     * each player and host. It is generated when the browser initially
     * connects to the server when the page loads for the first time.
     */
    mySocketId: '',

    init: function () {
        App.bindEvents();
    },

    // Event handlers for buttons
    bindEvents: function () {
		// Host
		// document.querySelector("#startGameButton").on('click', App.Host.onCreateClick);

        // Player
		// App.$doc.on('click', '.btnAnswer',App.Player.onPlayerAnswerClick);
		// TODO gérer playerMove ici ?
    },

	// ********** Host ********** //
    Host : {

        players : [],
        currentCorrectAnswer: '',
        difficulty: "lazy",

        onDifficultyClick: function (difficulty) {

            // Reset state
            document.querySelector("#lazy").attributes.state.value = "passive";
            document.querySelector("#easy").attributes.state.value = "passive";
            document.querySelector("#crazy").attributes.state.value = "passive";
            console.log(difficulty);
            // Active state
            document.querySelector("#"+difficulty).attributes.state.value = "active";

            this.difficulty = difficulty;
		},

        onCreateClick: function () {
			if(document.querySelector("#createGameButton").attributes.state.value != "disabled") {

                // Reset state
                document.querySelector("#lazy").attributes.state.value = "disabled";
                document.querySelector("#easy").attributes.state.value = "disabled";
                document.querySelector("#crazy").attributes.state.value = "disabled";
                // Active state
                document.querySelector("#"+this.difficulty).attributes.state.value = "active";

				console.log('Clicked "Create A Game" ' + youtubeVideoId + ' - ' + this.difficulty);
				IO.socket.emit('hostCreateNewGame', {
					youtubeVideoId	: youtubeVideoId,
					difficulty		: this.difficulty
				});

				document.querySelector("#createGameButton").attributes.state.value = "disabled";
			}
		},

		onStartClick: function () {
			if(document.querySelector("#startGameButton").attributes.state.value != "disabled") {
				
				console.log('Clicked "Start A Game"');
				IO.socket.emit('hostStartGame');

                // Hide buttons
                document.querySelector("#difficultyButtons").classList.add("hidden");
                document.querySelector("#startButtons").classList.add("hidden");
			}
        },

        gameInit: function (data) {

            var game    = data.game;
            var latency = data.latency;

			console.log(game);

            // Settings
            App.gameId 				= game.gameId;
			App.mySocketId 			= game.mySocketId;
			App.myRole 				= 'Host';
            App.latency 	        = latency;
            
            // Logic
			App.Player.position 	    = game.position;
            App.Player.artefactsToTake 	= game.arrayArtefacts;
            App.Player.artefactsTaken   = [];

			document.querySelector("#startGameButton").attributes.state.value = "passive";

            console.log("Game initialized with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
	},

	// ********** Player ********** //
    Player : {

        // position: 1,
        // This Player object is used to transit data through the WS

		onMove : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
			IO.socket.emit('playerMove', {playerPosition: App.Player.position});
        },
        
        // In case the player does not move but the position is right
        onEnergy : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
			IO.socket.emit('playerMove', {playerPosition: App.Player.position});
		}
	}
};

IO.init();
App.init();

// Dummy values for testing purpose

var youtubeVideoId 	= "3TygesLODpU";
var difficulty 		= "lazy";
