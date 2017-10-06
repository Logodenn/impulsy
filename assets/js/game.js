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
            console.log('Clicked "Create A Game" ' + youtubeVideoId + ' - ' + difficulty);
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
			var game = data.game;
            App.gameId 		= game.gameId;
            App.mySocketId 	= game.mySocketId;
            App.myRole 		= 'Host';
            console.log("Game initialized with ID: " + App.gameId + ' by host: ' + App.mySocketId);
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

var youtubeVideoId 	= "3TygesLODpU";
var difficulty 		= "lazy";

// *********************************************************************************************** //
// **************************************** CANVAS SETUP **************************************** //
// ********************************************************************************************* //

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

var r = 50;
var g = 200;
var b = 255;
var colorToChange = "g-";
var counterForAmplitudeColor = 0;
var counterForColorTab = 0;
var tabColorToChange = ["g-", "r+", "r-", "g+"];

// *********************************************************************************************** //
// **************************************** CONSTRUCTORS **************************************** //
// ********************************************************************************************* //

// ******************** Game variables ******************** //

var amplitudes = [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0];
var artefacts =  [1, 0, 2, 3, 0, 1, 2, 2, 0, 1, 2, 1, 1, 2, 2, 3, 0, 1, 2, 1, 1, 0, 2, 2, 1, 1, 1, 1, 2, 3, 0, 1, 2, 1, 0, 1, 2, 1, 1, 1, 2, 3, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1];
var time = 0;

// ******************** Components ******************** //

var player;
var energyBar;
var pulsers;
var listeBarres = [];
var listeArtefacts = [];

// ******************** Player ******************** //

function Player() {
	var self = this;
	self.x = 400;
	self.y = smallBarTop;
	self.img = new Image();
	self.img.src = "../img/unicorn.png";
	self.update = function() {
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Pulsers ******************** //

function Pulsers() {
	var self = this;
	self.x = 890;
	self.y = 150;
	self.img = new Image();
	self.img.src = "../img/pulsers.png";
	self.update = function() {
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, 103, 406);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, 103, 406);
}

// ******************** Artefact ******************** //

function Artefact(posY) {
	var self = this;
	self.x = myGameArea.canvas.width - 145;
	self.y = posY;
	self.img = new Image();
	self.img.src = "../img/artefact.png";
	self.update = function() {
		this.x -= 1;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, 20, 34);
	}

	self.ctx = myGameArea.context;
	ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Amplitude ******************** //

function Amplitude(height) {
	switch (tabColorToChange[counterForColorTab]) {
		case "r+":
		r += 15;
		break;
		case "r-":
		r -= 15;
		break;
		case "g+":
		g += 15;
		break;
		case "g-":
		g -= 15;
		break;
		case "b+":
		b += 15;
		break;
		case "b-":
		b -= 15;
		break;
		default:
	}

	if (counterForAmplitudeColor == 9) {
		counterForAmplitudeColor = 0;

		if (counterForColorTab == 3) {
			counterForColorTab = 0;
		} else {
			counterForColorTab++;
		}
	} else {
		counterForAmplitudeColor++;
	}

	this.color = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
	console.log(this.color);
	this.width = 25;
	this.height = height ? bigBarHeight : smallBarHeight;
	this.x = myGameArea.canvas.width - 130;
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

// ******************** EnergyBar ******************** //

function EnergyBar() {
	this.color = "#FFD51D";
	this.width = 500;
	this.height = 25;
	this.x = 250;
	this.y = 25;
	this.update = function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.ctx = myGameArea.context;
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

// ********************************************************************************************* //
// **************************************** GAME LOGIC **************************************** //
// ******************************************************************************************* //

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
		clearInterval(this.intervalUpdate);
	},
	stopAddition : function() {
		clearInterval(this.intervalAddAmplitude);
	}
}

function updateGameArea() {
	myGameArea.clear();

	for (i = 0; i < listeBarres.length; i += 1) {
		listeBarres[i].update();
		listeArtefacts[i].update();
	}

	pulsers.update();
	energyBar.update();
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

	time++;

	if(time > artefacts.length) {
		myGameArea.stopAddition();
	}
}

// ****************************************************************************************************** //
// **************************************** GAME INITIALIZATION **************************************** //
// **************************************************************************************************** //

function startGame() {

	myGameArea.start();

	player 		= new Player()
	energyBar 	= new EnergyBar()
	pulsers   	= new Pulsers()

	// ******************** Player movement ******************** //

	window.onkeyup = function(e) {

		// TODO: bind with canvas drawing
		// fill(COLOR.player);
		// rect(left, top, blocUnit, height);

		// TODO
		// Dynamize player position on canvas

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
				player.y = 263;
				break;
			case 69:
				// Midbot
				playerPosition = 2;
				player.y= 363;
				break;
			case 82:
				// Bot
				playerPosition = 3;
				player.y= 463;
				break;
			case 38:
				// Up arrow
				if(playerPosition != 0) {
		
					playerPosition--;
					player.y -= 100;
				}
				break;
			case 40:
				// Down arrow
				if(playerPosition != 3) {
		
					playerPosition++;
					player.y += 100;
				}
				break;
		}

		// ******************** Notify websocket ******************** //

		player.update();
		console.log("trying to emit new position through ws");
		App.player.onMove(playerPosition);
		// gameSocket.emit('playerMove', {message: "The player position is now:" + playerPosition});
	}
}