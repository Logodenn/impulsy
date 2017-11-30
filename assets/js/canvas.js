// ******************** Canvas setup ******************** //

var blocUnit = 0;
const visualCoefficient = 50;
const pulserWidth = 165;
const imgPath = "../img/canvas/";

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

// Used to move the player according to its numerical position, from 0 to 3
var Positions = [Canvas.topSlot, Canvas.middleTopSlot, Canvas.middleTopSlot, Canvas.botSlot];

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

var players 			= [];
var pulsers 			= [];
var canvasBars 			= [];
var canvasArtefacts 	= [];
var canvasDeathFlags  	= [];
var buttons				= [];

// ******************** Images ******************** //

var imgArtefact = new Image();
imgArtefact.src = imgPath + "artefact.png";

var imgArtefactTaken = new Image();
imgArtefactTaken.src = imgPath + "artefactTaken.png";

// ******************** Player ******************** //

function Player(definition) {
	var self = this;
	self.x 			= 4 * blocUnit;
	self.slot		= definition.position;
	self.y 			= Positions[definition.position];
	self.img 		= new Image();
	self.img.src 	= imgPath + "player" + definition.number + ".png";
	self.update 	= function() {
		self.x 			= 4 * blocUnit;
		self.y 			= Canvas.topSlot + self.slot * blocUnit;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}
	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Pulsers ******************** //

function Pulsers(i) {
	var self 		= this;
	self.index		= i;
	self.x 			= myGameArea.canvas.width - blocUnit;
	self.y 			= Canvas.topSlot + self.index * blocUnit;
	self.img 		= new Image();
	self.img.src 	= imgPath + "pulser.png";
	self.update 	= function() {
		self.x 			= myGameArea.canvas.width - blocUnit;
		self.y 			= Canvas.topSlot + self.index * blocUnit;
		ctx = myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}
	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}

// ******************** Death flags ******************** //
function DeathFlag(type) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - 2 * blocUnit;
	//self.y 			= Canvas.botSlot;
	self.y 			= Canvas.deathFlags;
	self.img 		= new Image();
	self.img.src 	= type == 0 ? imgPath + "deathFlagsAverage.png" : imgPath + "deathFlagBest.png";
	self.update 	= function() {
		self.cpt 		+= 1;
		self.y 			= Canvas.deathFlags;
        self.x 			= myGameArea.canvas.width - 2 * blocUnit - self.cpt * (3.5 * blocUnit / 400);
		ctx 			= myGameArea.context;
		ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.ctx.drawImage(self.img, self.x, self.y, blocUnit, blocUnit);
}


// ********************* Button ********************* //
function Button(y) {
	var self      	= this;
	self.slot		= y;
	self.width    	= Canvas.width;
	self.height   	= blocUnit;
	self.x        	= 0;
	self.y        	= Canvas.topSlot + self.slot * blocUnit;
	this.clicked  	= function(y) {
	  var mytop     = self.y;
	  var mybottom  = self.y + (self.height);
	  var clicked   = false;
	  console.log(mytop, mybottom);
	  if (y > mytop && y < mybottom) {
		  clicked   = true;
	  }
	  return clicked;
	}
	this.update		= function() {
		self.width    	= Canvas.width;
		self.height   	= blocUnit;
		self.x        	= 0;
		self.y        	= Canvas.topSlot + self.slot * blocUnit;
	}
}

// ******************** Artefact ******************** //

function Artefact(slot, playerNumber) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - 2 * blocUnit;
	self.slot		= slot;
	switch(self.slot) {
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
	self.img.src 	= imgPath + "artefact" + playerNumber + ".png";
	self.cpt		= 0;
	self.update 	= function() {
		self.cpt		+= 1;
		self.x 			= myGameArea.canvas.width - 2 * blocUnit - self.cpt * (3.5 * blocUnit / 400);
		switch(self.slot) {
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
	var self = this;
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

	self.barDefinition	= barDefinition;
	self.color 			= "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
	self.width 			= blocUnit / 4;
	self.height			= self.barDefinition.amplitude * blocUnit * 4;
	self.x 				= myGameArea.canvas.width - 1.5 * blocUnit;
	self.y				= Canvas.spectrumAxis - self.height * 0.5;
	self.cpt			= 0;
	self.update 		= function() {
		self.width 		= blocUnit / 4;
		self.height		= self.barDefinition.amplitude * blocUnit * 4;
		self.cpt		+= 1;
		self.x 			= myGameArea.canvas.width - 1.5 * blocUnit - self.cpt * (3.5 * blocUnit / 400);
		self.y			= Canvas.spectrumAxis - self.height * 0.5;
		ctx 			= myGameArea.context;
		ctx.fillStyle 	= self.color;
		ctx.fillRect(self.x, self.y, self.width, self.height);
	}
	self.ctx = myGameArea.context;
	self.ctx.fillStyle = self.color;
	self.ctx.fillRect(self.x, self.y, self.width, self.height);
}

// ******************** EnergyBarSlot ******************** //

function EnergyBarSlot() {

	var computedX = (Canvas.width * 0.5) - (App.energy * 0.5 * visualCoefficient);
	
	this.color 		= COLOR.energyBarSlot;
	this.width 		= App.energy * visualCoefficient;
	this.height 	= energyBar.height;
	// this.x 			= Canvas.width / 10;
	this.x			= computedX;
	this.y 			= blocUnit * 0;
	this.update 	= function() {
		computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);
		this.width 		= App.Player.energy * visualCoefficient;
		this.height 	= energyBar.height;
		this.x			= computedX;
		this.y 			= blocUnit * 0;
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

	var computedX = (Canvas.width * 0.5) - (App.energy * 0.5 * visualCoefficient);

	this.color 		= COLOR.energyBar;
	this.width 		= App.energy * visualCoefficient;
	this.height 	= energyBar.height;
	this.x			= computedX;
	this.y 			= blocUnit * 0;
	this.update 	= function() {
		computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);
		this.width 		= App.Player.energy * visualCoefficient;
		this.height 	= energyBar.height;
		this.x			= computedX;
		this.y 			= blocUnit  * 0;
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
		this.canvas.width 	= window.innerWidth * 0.7;
		this.canvas.height 	= this.canvas.width * 0.6;
		this.context 		= this.canvas.getContext("2d");

		updateBlocUnit(this.canvas.width);

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

	for (i = 0; i < players.length; i++) {
		players[i].update();
	}

	if(App.Host.difficulty != "lazy") {
		energyBarSlot.update();
		energyBar.update();
	}
}

function addAmplitudeAndArtefact() {
	var amplitude  = new Amplitude(App.Host.audioSpectrum[time]);
	canvasBars.push(amplitude);

	var artefact = new Artefact(App.Host.audioSpectrum[time].artefacts[App.Player.number], App.Player.number);
	canvasArtefacts.push(artefact);

	if(App.mode == "solo") {
		// TODO check for coop mode (it is actually a dirty fix)

		if(App.Host.deathFlags.length > 0) {
	
	
			if(time == App.Host.deathFlags[0]["AVG(duration)"]){
				var deathFlag = new DeathFlag(0);
				canvasDeathFlags.push(deathFlag);
			}
			
			if(time == App.Host.deathFlags[1]["duration"]) {
				var deathFlag = new DeathFlag(1);
				canvasDeathFlags.push(deathFlag);
			}
		}
	}

	time++;
	// console.log(time + "   " + App.Host.audioSpectrum.length);

	if(time >= App.Host.audioSpectrum.length) {
		myGameArea.stopAddition();		
	}
}

function updateBlocUnit(canvasWidth) {
	blocUnit = canvasWidth/ 10;
	
	Canvas.width			= 10 * blocUnit;
	Canvas.height  			= 6 * blocUnit;
	Canvas.deathFlags		= 1 * blocUnit;
	Canvas.spectrumAxis		= 4 * blocUnit;
	Canvas.topSlot			= 2 * blocUnit;
	Canvas.middleTopSlot	= 3 * blocUnit;
	Canvas.middleBotSlot	= 4 * blocUnit;
	Canvas.botSlot			= 5 * blocUnit;

	energyBar.height  = blocUnit * 0.5;
    energyBar.width   = null;
    energyBar.y		= blocUnit * 0;
}

// ****************************************************************************************************** //
// **************************************** GAME INITIALIZATION **************************************** //
// **************************************************************************************************** //

function startGame() {

	// Hide buttons
	document.querySelector("#startButtons").classList.add("hidden");
	// Display score
	document.querySelector("#score").classList.remove("hidden");
	
	// Set score view
	// document.querySelector("#artefactsToTake").innerHTML = App.Player.artefactsToTake.length;
	// document.querySelector("#artefactsToTake").innerHTML = App.energy;
<<<<<<< HEAD
=======
	console.log(canvasArtefacts)
>>>>>>> 557a0fd2921d898b2f27cbf6b4276e86e05b9ffa
	document.querySelector("#artefactsToTake").innerHTML = App.Host.energy;

	myGameArea.start();

	console.log("KKKKK", App.Players.length);
	// Generate player visuals with the definition from the back
	for(var i = 0; i < App.Players.length; i++) {
		players.push(new Player(App.Players[i]));
	}

	// Handle energyBar only if the difficulty is easy or crazy
	if(App.difficulty != "lazy") {
		energyBarSlot 	= new EnergyBarSlot();
		energyBar		= new EnergyBar();
	}

	for (var i = 0; i < 4; i++) {
		var pulser = new Pulsers(i);
		pulsers.push(pulser);
	} 

	for (var i = 0; i < 4; i++) {
		var button = new Button(i);
		buttons.push(button);
	} 

	// ******************** Player movement on key event ******************** //

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
				App.Players[App.Player.number].position = 0;
				players[App.Player.number].slot = 0;
				break;
			case 90:
				// Midtop
				App.Players[App.Player.number].position = 1;
				players[App.Player.number].slot = 1;
				break;
			case 69:
				// Midbot
				App.Players[App.Player.number].position = 2;
				players[App.Player.number].slot = 2;
				break;
			case 82:
				// Bot
				App.Players[App.Player.number].position = 3;
				players[App.Player.number].slot = 3;
				break;
			case 38:
				// Up arrow
				if(App.Players[App.Player.number].position != 0) {
		
					App.Players[App.Player.number].position--;
					players[App.Player.number].slot -= 1;
				}
				break;
			case 40:
				// Down arrow
				if(App.Players[App.Player.number].position != 3) {
		
					App.Players[App.Player.number].position++;
					players[App.Player.number].slot += 1;
				}
				break;
		}

		// ******************** Player movement on click event ******************** //
		
		window.onclick = function(e) {
			// Get the canvas's positions
			var rect = myGameArea.canvas.getBoundingClientRect();
		
			//  Adapt the click coordinates to the canvas
			x = e.pageX - rect.left;
			y = e.pageY - rect.top;
			console.log(x, y)
			if (x > 0 && x < Canvas.width && y > 0 && y < Canvas.height) {
				for (var i = 0; i < 4; i++) {
					if(buttons[i].clicked(y) == true) {
						App.Players[App.Player.number].position = i;
						players[App.Player.number].slot = i;
					}
				}
			}
		}

		// ******************** Notify websocket ******************** //
		App.Player.onMove();
	}
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

	document.querySelector("#artefactsTaken").innerHTML = data.takenArtefactsCount;

	// Handle artefact checking
	if(gameState.isArtefactTaken) {

		// App.Player.artefactsTaken.push(App.Player.artefactsToTake[gameState.bar]);
		// console.log("Nb of taken artefact : " + App.Player.artefactsTaken.length);

		// Write score in view
		// document.querySelector("#artefactsTaken").innerHTML = App.Player.artefactsTaken.length;

		// Update artefact visual
		canvasArtefacts[gameState.bar].isTaken()
	}
}

window.onresize = function() {
	myGameArea.canvas.width 	= window.innerWidth * 0.8;
	myGameArea.canvas.height 	= myGameArea.canvas.width * 0.6;
	
	updateBlocUnit(myGameArea.canvas.width);

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].update();
		console.log("button updated");
	} 
}

function endGame (data) {
	if(data.win) {
		// document.querySelector("#gameState").innerHTML = "Congrats, you gathered all the artefacts!";
		// document.querySelector("#gameState").innerHTML = App.Player.artefactsTaken.length
		document.querySelector("#gameState").innerHTML = data.score;
	} else {
		// document.querySelector("#gameState").innerHTML = "You gathered " + App.Player.artefactsTaken + " out of " + App.energy + " artefacts!";
	}
	// Show pop up
	document.querySelector("#endGameLayer").classList.remove("hidden");
	// Blur canvas
	document.querySelector("#canvasWrapper").classList.add("blurred");
}
