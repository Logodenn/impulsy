
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
        IO.socket.on('playerMove', IO.playerMove);
        IO.socket.on('gameOver', IO.gameOver);
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

    playerMove : function(data) {
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
            // console.log('Clicked "Create A Game"');
            IO.socket.emit('hostCreateNewGame');
		},
		
		onStartClick: function () {
            // console.log('Clicked "Create A Game"');
            IO.socket.emit('hostCreateNewGame');
        },

        gameInit: function (data) {
            App.gameId 		= data.gameId;
            App.mySocketId 	= data.mySocketId;
            App.myRole 		= 'Host';
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
	},
	
	// ********** Player ********** //
    Player : {
		onMove : function(data) {
			IO.socket.emit('hostCreateNewGame');
		}
	}
};

IO.init();
App.init();

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
		gameSocket.emit('playerMove', {message: "The player position is now:" + playerPosition});
	}
}


// var model = {
// 	gameName	: "Impulsy",
// 	catchPhrase	: "Ride the music!"
// }

/*var context = {gameName: "Impulsy", catchPhrase: "Ride the music!"};
var html    = template(context);*/











var amplitudes = [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0];
var artefacts =  [1, 0, 2, 3, 0, 1, 2, 2, 0, 1, 2, 1, 1, 2, 2, 3, 0, 1, 2, 1, 1, 0, 2, 2, 1, 1, 1, 1, 2, 3, 0, 1, 2, 1, 0, 1, 2, 1, 1, 1, 2, 3, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1];
var time = 0;
var listeBarres = [];
var listeArtefacts = [];
var player;


function startGame() {
	myGameArea.start();
	player = new Player()
}

var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function() {
			this.canvas.width = 1000;
			this.canvas.height = canvasHeight;
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas, document.querySelector("#canvasWrapper"));
			this.intervalAddAmplitude = setInterval("addAmplitudeAndArtefact();",500);
			this.intervalUpdate = setInterval("updateGameArea();", 10);
	},
	clear : function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop : function() {
			clearInterval(this.intervalAddAmplitude);
			clearInterval(this.intervalUpdate);
	}
}


function Player() {
	var self = this;
	self.x = 400;
	self.y = 225;
	self.img = new Image();
	self.img.src = "licorne.png";
	self.update = function() {
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

function Artefact(posY) {
	var self = this;
	self.x = myGameArea.canvas.width;
	self.y = posY;
	self.img = new Image();
	self.img.src = "artefact.png";
	self.update = function() {
			this.x -= 1;
			ctx = myGameArea.context;
			ctx.drawImage(self.img, self.x, self.y, 20, 34);
	}

	self.ctx = myGameArea.context;
	ctx.drawImage(self.img, self.x, self.y, 40, 38);
}

function Amplitude(height) {
	this.color = "#11CADC";
	this.width = 15;
	this.height = height ? bigBarHeight : smallBarHeight;
	this.x = myGameArea.canvas.width;
	this.y = canvasHeight / 2 - this.height / 2;
	this.update = function() {
			this.x -= 1;
			ctx = myGameArea.context;
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.ctx = myGameArea.context;
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}


function updateGameArea() {
	myGameArea.clear();
	console.log(listeBarres);
	for (i = 0; i < listeBarres.length; i++) {
		listeBarres[i].update();
		listeArtefacts[i].update();
		console.log("update");
	}

	if (myGameArea.keys && myGameArea.keys[65]) {}
	if (myGameArea.keys && myGameArea.keys[90]) {player.y = 263; }
	if (myGameArea.keys && myGameArea.keys[69]) {player.y= 363; }
	if (myGameArea.keys && myGameArea.keys[82]) {player.y= 463; }

	player.update();
}


function addAmplitudeAndArtefact() {
	var amplitude  = new Amplitude(amplitudes[time]);
	listeBarres.push(amplitude);

	var artefact;
	switch (artefacts[time]) {
		case 0:
			artefact  = new Artefact(blocUnit);
			break;
		case 1:
			artefact  = new Artefact(2 * blocUnit);
			break;
		case 2:
			artefact  = new Artefact(3 * blocUnit);
			break;
		case 3:
			artefact  = new Artefact(4 * blocUnit);
			break;
	}
	listeArtefacts.push(artefact);

	console.log(time);
	time++;

	if(time > artefacts.length) {
		myGameArea.stop();
	}
}




