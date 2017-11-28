// ******************** Canvas setup ******************** //

const blocUnit = 100;
const visualCoefficient = 50;
const pulserWidth = 165;

// How to read blocUnit
// 0 * blocUnit energyBar and deathFlags
// 1 * blocUnit deathFlags
// 2 * blocUnit topSlot
// 3 * blocUnit middleTopSlot
// 4 * blocUnit middleBotSlot
// 5 * blocUnit botSlot
// 6 blocUnits are used to draw the height of the Canvas

var Canvas = {    
	width			: 10 * blocUnit,
	height  		: 6 * blocUnit,
	spectrumAxis	: 4 * blocUnit,
	deathFlags		: 1 * blocUnit,
	topSlot			: 2 * blocUnit,
	middleTopSlot	: 3 * blocUnit,
	middleBotSlot	: 4 * blocUnit,
	botSlot			: 5 * blocUnit,
}

var energyBar = {
    height  : blocUnit * 0.5,
    width   : null,
    y		: blocUnit * 0
}

// ******************** Colors ******************** //

var COLOR = {
	energyBar		: "#FAC32C",
	energyBarSlot	: "#716383"
}
var r = 50;
var g = 200;
var b = 255;
var colorToChange = "g-";
var counterForAmplitudeColor = 0;
var counterForColorTab = 0;
var tabColorToChange = ["g-", "r+", "r-", "g+"];

// ******************** Game variables ******************** //

var time = 0;

// ******************** Components ******************** //

var player;
var pulsers 			= [];
var canvasBars 			= [];
var canvasArtefacts 	= [];
var canvasDeathFlags  	= [];
var buttons				= [];

// ******************** Images ******************** //

var imgArtefact = new Image();
imgArtefact.src = "../img/artefact.png";

var imgArtefactTaken = new Image();
imgArtefactTaken.src = "../img/artefactTaken.png";

// ******************** Player ******************** //

function Player() {
	var self = this;
	self.x 			= 400;
	self.y 			= Canvas.middleTopSlot;
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

// ******************** Death flags ******************** //
function DeathFlag(type) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - 165;
	// self.y 			= Canvas.botSlot;
	self.y 			= Canvas.deathFlags;
	self.img 		= new Image();
	self.img.src 	= type == 0 ? "../img/deadFlagsAverage.png" : "../img/deadFlagBest.png";
	self.update 	= function() {
        self.x -= 1;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}


// ********************* Button ********************* //
function Button(y) {
	var self      = this;
	self.width    = myGameArea.canvas.width;
	self.height   = blocUnit;
	self.x        = 0;
	self.y        = y;
	this.clicked  = function(y) {
	  var mytop     = self.y;
	  var mybottom  = self.y + (self.height);
	  var clicked   = false;
	  if (y > mytop && y < mybottom) {
		  clicked   = true;
	  }
	  return clicked;
	}
}

// ******************** Artefact ******************** //

function Artefact(slot) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - pulserWidth;
	switch(slot) {
		case 0:
			self.y = Canvas.topSlot;
			break;
		case 1:
			self.y = Canvas.middleTopSlot;
			break;
		case 2:
			self.y = Canvas.middleBotSlot;
			break;
		case 3:
			self.y = Canvas.botSlot;
			break;
	}
	self.img 		= new Image();
	self.img.src 	= "../img/artefact.png";
	self.update 	= function() {
		this.x -= 1;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}
	self.isTaken = function() {
		self.img = imgArtefactTaken;
	}
	self.ctx = myGameArea.context;
	ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Amplitude ******************** //

function Amplitude(barDefinition) {
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
	this.height		= barDefinition.amplitude * blocUnit * 4;
	this.x 			= myGameArea.canvas.width - 130;
	this.y			= Canvas.spectrumAxis - this.height * 0.5;
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

// ******************** EnergyBarSlot ******************** //

function EnergyBarSlot() {

	var computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);
	
	this.color 		= COLOR.energyBarSlot;
	this.width 		= App.Player.energy * visualCoefficient;
	this.height 	= energyBar.height;
	// this.x 			= Canvas.width / 10;
	this.x			= computedX;
	this.y 			= blocUnit * 0;
	this.update 	= function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.ctx 			= myGameArea.context;
	this.ctx.fillStyle 	= this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

// ******************** EnergyBar ******************** //

function EnergyBar() {

	var computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);

	this.color 		= COLOR.energyBar;
	this.width 		= App.Player.energy * visualCoefficient;
	this.height 	= energyBar.height;
	// this.x 			= Canvas.width / 10;
	this.x			= computedX;
	this.y 			= blocUnit * 0;
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

		// Show the up and down buttons - is hidden if media query is browser
		document.querySelector("#moveButtons").classList.remove("hidden");

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

	for (i = 0; i < canvasBars.length; i++) {
		canvasBars[i].update();
		canvasArtefacts[i].update();
	}

	for (i = 0; i < pulsers.length; i++) {
		pulsers[i].update();
	}

	for (i = 0; i < canvasDeathFlags.length; i++) {
		canvasDeathFlags[i].update();
	}

	if(App.Host.difficulty != "lazy") {
		energyBarSlot.update();
		energyBar.update();
	}
	player.update();
}

function addAmplitudeAndArtefact() {
	var amplitude  = new Amplitude(App.Host.audioSpectrum[time]);
	canvasBars.push(amplitude);

	var playerNumber = 0; // TODO dynamize
	// playerNumber = 1;

	var artefact = new Artefact(App.Host.audioSpectrum[time].artefacts[playerNumber]);
	canvasArtefacts.push(artefact);

    if(time == App.Host.deathFlags[0]["AVG(duration)"]){
        var deathFlag = new DeathFlag(0);
		canvasDeathFlags.push(deathFlag);
    }
    if(time == App.Host.deathFlags[1]["duration"]) {
        var deathFlag = new DeathFlag(1);
		canvasDeathFlags.push(deathFlag);
    }

	time++;

	if(time >= App.Host.audioSpectrum.length) {
		myGameArea.stopAddition();		
	}
}

// ****************************************************************************************************** //
// **************************************** GAME INITIALIZATION **************************************** //
// **************************************************************************************************** //

function startGame() {
	
	// Set score view
	// document.querySelector("#artefactsToTake").innerHTML = App.Player.artefactsToTake.length;
	document.querySelector("#artefactsToTake").innerHTML = App.Player.energy;

	myGameArea.start();

	player = new Player();
	console.log(App.Host.difficulty);
	if(App.Host.difficulty != "lazy") {
		// Handle energyBar only if ht edifficulty is easy or crazy
		energyBarSlot 	= new EnergyBarSlot();
		energyBar		= new EnergyBar();
	}

	for (var i = 0; i < 4; i++) {
		var pulser = new Pulsers(Canvas.topSlot + i * blocUnit);
		pulsers.push(pulser);
	} 

	for (var i = 0; i < 4; i++) {
		var button = new Button(Canvas.topSlot + i * blocUnit);
		buttons.push(button);
	} 

	// ******************** Player movement ******************** //

	window.onkeyup = function(e) {

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
				player.y = Canvas.topSlot;
				break;
			case 90:
				// Midtop
				App.Player.position = 1;
				player.y = Canvas.middleTopSlot;
				break;
			case 69:
				// Midbot
				App.Player.position = 2;
				player.y = Canvas.middleBotSlot;
				break;
			case 82:
				// Bot
				App.Player.position = 3;
				player.y = Canvas.botSlot;
				break;
			case 38:
				// Up arrow
				if(App.Player.position != 0) {
		
					App.Player.position--;
					player.y -= blocUnit;
				}
				break;
			case 40:
				// Down arrow
				if(App.Player.position != 3) {
		
					App.Player.position++;
					player.y += blocUnit;
				}
				break;
		}

		// ******************** Notify websocket ******************** //
		App.Player.onMove(App.Player.position);
	}
}


window.onclick = function(e) {
	// Get the canvas's positions
	var rect = myGameArea.canvas.getBoundingClientRect();

	//  Adapt the click coordinates to the canvas
	x = e.pageX - rect.left;
	y = e.pageY - rect.top;
	console.log(x, y)
	if (x > 0 && x < myGameArea.canvas.width && y > 0 && y < myGameArea.canvas.height) {
		for (var i = 0; i < 4; i++) {
			if(buttons[i].clicked(y)) {
				App.Player.position = i;
				player.y = Canvas.topSlot + i * blocUnit;
			}
		}
	}
	App.Player.onMove(App.Player.position);
}

function updateGameScene(data) {
	var gameState = data; // Dirty, back should send data, not data.data
	// gameState is so : { energy: 163, isArtefactTaken: false, nbArtefacts: null, bar: 31 }

	if(App.Host.difficulty != "lazy") {
		// Handle energy
		energyBar.width = gameState.energy * visualCoefficient; // TODO this should be done in .update()
		energyBarSlot.update();
		energyBar.update();
	}

	// Handle artefact checking
	if(gameState.isArtefactTaken) {

		// App.Player.artefactsTaken.push(App.Player.artefactsToTake[gameState.bar]);
		// console.log("Nb of taken artefact : " + App.Player.artefactsTaken.length);

		// Write score in view
		// document.querySelector("#artefactsTaken").innerHTML = App.Player.artefactsTaken.length;
		document.querySelector("#artefactsTaken").innerHTML = App.Player.energy;

		// Update artefact visual
		canvasArtefacts[gameState.bar].isTaken()
	}
}

function onTabletMove(direction) {
	// TODO
	// it's a dirty way to do this
	// centralize the keyListeners and the buttonMoveListener

	console.log(direction);

	switch(direction) {
		case 'up':
			// Up arrow
			if(App.Player.position != 0) {
				
				App.Player.position--;
				player.y -= smallBar.height / 2;
			}
			break;
		case 'down':
			// Down arrow
			if(App.Player.position != 3) {
				
				App.Player.position++;
				player.y += smallBar.height / 2;
			}
			break;
	}

	// ******************** Notify websocket ******************** //
	App.Player.onMove(App.Player.position);
}

function endGame (data) {
	if(data.win) {
		// document.querySelector("#gameState").innerHTML = "Congrats, you gathered all the artefacts!";
		// document.querySelector("#gameState").innerHTML = App.Player.artefactsTaken.length
		document.querySelector("#gameState").innerHTML = App.Player.energy
	} else {
		// document.querySelector("#gameState").innerHTML = "You gathered " + App.Player.artefactsTaken + " out of " + App.Player.energy + " artefacts!";
	}
	// Show pop up
	document.querySelector("#endGameLayer").classList.remove("hidden");
	// Blur canvas
	document.querySelector("#canvasWrapper").classList.add("blurred");
}