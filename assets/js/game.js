var chunkArray = [];
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
		/*var audio = document.createElement('audio');
		ss(IO.socket).on('audioChunks', function(stream, data) {
			parts = [];
			console.log("ajfnzajinfjaznfjkankjan");
			stream.on('data', function(chunk){
				parts.push(chunk);
				console.log("fjfjfjfj");
			});
			stream.on('end', function () {
				audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
			});
		});*/
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
	
	onAudioChunk: function(data) { // { chunk: chunk, sampleRate: sampleRate }
		if (!App.startTime) {
			App.startTime = App.audioContext.currentTime;
		}

		var audio = data.chunk;
		chunkArray.push(audio);
		if (chunkArray.length % 20 == 0) {
			var fileReader = new FileReader();
			var source = App.audioContext.createBufferSource();
			var blob = new Blob(chunkArray);
			fileReader.readAsArrayBuffer(blob);
			fileReader.onloadend = function () {
				App.audioContext.decodeAudioData(this.result, function(buffer) {
					source.buffer = buffer;
					source.connect(App.audioContext.destination);
					source.start(App.startTime + App.lastBufferDuration, App.lastBufferDuration);
					App.lastBufferDuration = buffer.duration;
				});
			}
		}
	}
};

// ******************** App ******************** //

var App = {

    gameId: 0,
	myRole: '',   // 'Player' or 'Host'
	audioContext: new (window.AudioContext || window.webkitAudioContext)(),
	lastBufferDuration: 0,

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
	}
};

IO.init();
App.init();

// Dummy values for testing purpose

var youtubeVideoId 	= "3TygesLODpU";
var difficulty 		= "lazy";

