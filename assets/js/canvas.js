// *********************************************************************************************** //
// **************************************** CANVAS SETUP **************************************** //
// ********************************************************************************************* //

var blocUnit = 100;

var smallBar = {
    height  : blocUnit * 2,
    width   : blocUnit / 4,
    // position: App.Canvas.bar.big.position + App.Canvas.bar.big.height / 4
    position: null
}

var bigBar = {
    height  : smallBar.height * 2,
    width   : blocUnit / 4,
    // position: App.Canvas.bar.energy.position + App.Canvas.bar.energy.height + blocUnit
    position: null
}

var energyBar = {
    height  : blocUnit / 4,
    width   : null,
    position: blocUnit,
    // color   : "#FFD51D",

    // // x: 250,
    // x: null,
    // draw: function() {
    //     ctx = myGameArea.context;
    //     ctx.fillStyle = this.color;
    //     ctx.fillRect(this.x, this.y, this.width, this.height);
    // }
}

var Canvas = {    
    width	: 10 * blocUnit,
    height	: bigBar.height + energyBar.height + 3 * blocUnit, // Height = biggest bar + energy bar + margins
    // height  : 8 * blocUnit
}

// To make it full dynamic, set the following parameters here
bigBar.position     = energyBar.position + energyBar.height + blocUnit;
smallBar.position   = bigBar.position + bigBar.height / 4
energyBar.width     = 8 * blocUnit;

// ******************** Colors ******************** //

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

var amplitudes 	= [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0];
var artefacts 	=  [1, 0, 2, 3, 0, 1, 2, 2, 0, 1, 2, 1, 1, 2, 2, 3, 0, 1, 2, 1, 1, 0, 2, 2, 1, 1, 1, 1, 2, 3, 0, 1, 2, 1, 0, 1, 2, 1, 1, 1, 2, 3, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1];
var time 		= 0;

// ******************** Components ******************** //

var player;
var energyBar;
var pulsers 		= [];
var listeBarres 	= [];
var listeArtefacts 	= [];

// ******************** Player ******************** //

function Player() {
	var self = this;
	self.x 			= 400;
	self.y 			= smallBar.position;
	self.img 		= new Image();
	self.img.src 	= "../img/unicorn.png";
	self.update 	= function() {
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Pulsers ******************** //

function Pulsers(posY) {
	var self 		= this;
	self.x 			= 890;
	self.y 			= posY;
	self.img 		= new Image();
	self.img.src 	= "../img/pulser.png";
	self.update 	= function() {
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Artefact ******************** //

function Artefact(posY) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - 165;
	self.y 			= posY;
	self.img 		= new Image();
	self.img.src 	= "../img/artefact.png";
	self.update 	= function() {
		this.x -= 1;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
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

	this.color 		= "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
	this.width 		= 25;
	this.height 	= height ? bigBar.height : smallBar.height;
	this.x 			= myGameArea.canvas.width - 130;
	this.y 			= height ? bigBar.position : smallBar.position;
	this.update 	= function() {
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
	this.color 		= "#FFD51D";
	this.width 		= energyBar.width;
	this.height 	= energyBar.height;
	this.x 			= Canvas.width / 10;
	this.y 			= energyBar.position;
	this.update 	= function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.ctx 			= myGameArea.context;
	this.ctx.fillStyle 	= this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

// ********************************************************************************************* //
// **************************************** GAME LOGIC **************************************** //
// ******************************************************************************************* //

var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function() {

		// ******************** Canvas setup ******************** //

		this.canvas.width 	= Canvas.width;
		this.canvas.height 	= Canvas.height;
		this.context 		= this.canvas.getContext("2d");

		document.querySelector("#canvasWrapper").appendChild(this.canvas);

		// ******************** Interval setup ******************** //

		this.intervalAddAmplitude 	= setInterval("addAmplitudeAndArtefact();",500);
		this.intervalUpdate 		= setInterval("updateGameArea();", 10);

		// ******************** Variables ******************** //
		
		//playerPosition = 1; // Default player position - important for arrow listeners
		
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

	for (i = 0; i < listeBarres.length; i++) {
		listeBarres[i].update();
		listeArtefacts[i].update();
	}

	for (i = 0; i < pulsers.length; i++) {
		pulsers[i].update();
	}

	energyBar.update();
	player.update();
}

function addAmplitudeAndArtefact() {
	var amplitude  = new Amplitude(amplitudes[time]);
	listeBarres.push(amplitude);

	var artefact = new Artefact(bigBar.position + artefacts[time] * blocUnit);
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

	for (var i = 0; i < 4; i++) {
		var pulser = new Pulsers(bigBar.position + i * blocUnit);
		pulsers.push(pulser);
	} 

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
				App.Player.position = 0;
				player.y = bigBar.position;
				break;
			case 90:
				// Midtop
				App.Player.position = 1;
				player.y = bigBar.position + 1 * blocUnit;
				break;
			case 69:
				// Midbot
				App.Player.position = 2;
				player.y = bigBar.position + 2 * blocUnit;
				break;
			case 82:
				// Bot
				App.Player.position = 3;
				player.y = bigBar.position + 3 * blocUnit;
				break;
			case 38:
				// Up arrow
				if(App.Player.position != 0) {
		
					App.Player.position--;
					player.y -= smallBar.height / 2;
				}
				break;
			case 40:
				// Down arrow
				if(App.Player.position != 3) {
		
					App.Player.position++;
					player.y += smallBar.height / 2;
				}
				break;
		}

		// ******************** Notify websocket ******************** //
		console.log(player.y);
		App.Player.onMove(App.Player.position);
	}
}