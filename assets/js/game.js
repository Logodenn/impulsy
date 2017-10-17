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

	gameOver : function(data) {
		endGame();
		// TODO
		// Notify players that game has ended
		// remove listeners
	},
	
	onAudioChunk: function(data) {
		App.Audio.chunkArray.push(data.chunk);
	},
	onAudioEnd: function() {
		var fileReader = new FileReader();
		var source = App.Audio.audioContext.createBufferSource();
		var blob = new Blob(App.Audio.chunkArray);

		fileReader.onloadend = function () {
			App.Audio.audioContext.decodeAudioData(this.result, function(buffer) {
				source.buffer = buffer;
				source.connect(App.Audio.audioContext.destination);
				source.start();
			});
		}

		fileReader.readAsArrayBuffer(blob);
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

        onCreateClick: function () {
			if(document.querySelector("#createGameButton").attributes.state.value != "disabled") {

				console.log('Clicked "Create A Game" ' + youtubeVideoId + ' - ' + difficulty);
				IO.socket.emit('hostCreateNewGame', {
					youtubeVideoId	: youtubeVideoId,
					difficulty		: difficulty
				});

				document.querySelector("#createGameButton").attributes.state.value = "disabled";
			}
		},

		onStartClick: function () {
			if(document.querySelector("#startGameButton").attributes.state.value != "disabled") {
				
				console.log('Clicked "Start A Game"');
				IO.socket.emit('hostStartGame');

				document.querySelector("#startButtons").classList.add("hidden");
			}
        },

        gameInit: function (data) {

			var game = data.game;

			console.log(game);

            App.gameId 				= game.gameId;
			App.mySocketId 			= game.mySocketId;
			App.myRole 				= 'Host';
			App.Player.position 	= game.position;

			document.querySelector("#startGameButton").attributes.state.value = "passive";

            console.log("Game initialized with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
	},

	// ********** Player ********** //
    Player : {

		// position: 1,

		onMove : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
			IO.socket.emit('playerMove', {playerPosition: App.Player.position});
		}
	},

	// ********** Audio ********** //
	Audio : {
		audioContext: new (window.AudioContext || window.webkitAudioContext)(),
		chunkArray: []
	}
};

IO.init();
App.init();

// Dummy values for testing purpose

//var youtubeVideoId 	= "x5_DHuWpjeA";
var youtubeVideoId 	= "utH9UCr0p8Q";
var difficulty 		= "lazy";

