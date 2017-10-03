
// ******************************************************************* //
// ******************** WEBSOCKET INITIALIZATION ******************** //
// ***************************************************************** //

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
        // IO.socket.on('error', IO.error );
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
		startGameTmp();
		// TODO
    },

    onPlayerMove : function(data) {
		// TODO
		// Notify players that a player has moved
	},

	gameOver : function(data) {
		endGame();
		// TODO
		// Notify players that game has ended
		// remove listeners
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
            console.log('Clicked "Create A Game"' + youtubeVideoId + difficulty);
            IO.socket.emit('hostCreateNewGame', {
				youtubeVideoId	: youtubeVideoId,
				difficulty		: difficulty
			});
		},

		onStartClick: function () {
            console.log('Clicked "Start A Game"');
            IO.socket.emit('hostStartGame');
        },

        gameInit: function (data) {
            App.gameId 		= data.gameId;
            App.mySocketId 	= data.mySocketId;
            App.myRole 		= 'Host';
            console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
	},

	// ********** Player ********** //
    Player : {
		onMove : function(data) {
			console.log('Player moved');
			IO.socket.emit('playerMove', {playerPosition: playerPosition});
		}
	}
};

IO.init();
App.init();

// Dummy values for testing purpose

var youtubeVideoId 	= "8aJw4chksqM";
var difficulty 		= "lazy";

// ******************************************************* //
// ******************** CANVAS SETUP ******************** //
// ***************************************************** //

// ******************** Canvas units ******************** //

var blocUnit 		= 50;
var bigBarHeight 	= blocUnit * 4;
var bigBarTop 		= blocUnit;
var smallBarHeight 	= blocUnit * 2;
var smallBarTop 	= bigBarHeight/2 - smallBarHeight/2 + blocUnit;
var canvasHeight	= bigBarHeight + 2 * blocUnit;

// ******************** Colors ******************** //

var COLOR = {
	bar 		: [170, 22, 33], // Red
	artefact 	: [33, 150, 200], // Blue
	player 		: [200, 10, 100] //
}

// ***************************************************** //
// ******************** GAME LOGIC ******************** //
// *************************************************** //

function startGameTmp() {

	// ******************** Player movement ******************** //

	window.onkeyup = function(e) {

		// TODO: bind with canvas drawing
		// fill(COLOR.player);
		// rect(left, top, blocUnit, height);

		var key = e.keyCode ? e.keyCode : e.which;
		// a : top = 65
		// z : midtop = 90
		// e : midbot = 69
		// r : bot = 82
		// Up: 38
		// Down: 40
		switch (key) {
			case 65:
				// Top
				playerPosition = 0;
				player.y = 163;
				break;
			case 90:
				// Midtop
				playerPosition = 1;
				break;
			case 69:
				// Midbot
				playerPosition = 2;
				break;
			case 82:
				// Bot
				playerPosition = 3;
				break;
			case 38:
				// Up arrow
				if(playerPosition != 0) {

					playerPosition--;
				}
				break;
			case 40:
				// Down arrow
				if(playerPosition != 3) {

					playerPosition++;
				}
				break;
		}

		// ******************** Notify websocket ******************** //
		console.log("trying to emit new position through ws");
		App.player.onMove(playerPosition);
		// gameSocket.emit('playerMove', {message: "The player position is now:" + playerPosition});
	}
}


// var model = {
// 	gameName	: "Impulsy",
// 	catchPhrase	: "Ride the music!"
// }

/*var context = {gameName: "Impulsy", catchPhrase: "Ride the music!"};
var html    = template(context);*/
