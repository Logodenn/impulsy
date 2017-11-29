// ******************** Canvas setup ******************** //

var blocUnit = 0;
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
	self.x 			= 4 * blocUnit;
	self.slot		= 1;
	self.y 			= Canvas.middleTopSlot;
	self.img 		= new Image();
	self.img.src 	= "../img/unicorn.png";
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
	self.img.src 	= "../img/pulser.png";
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
	self.img.src 	= type == 0 ? "../img/deadFlagsAverage.png" : "../img/deadFlagBest.png";
	self.cpt		= 0;
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

function Artefact(slot) {
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
	self.img.src 	= "../img/artefact.png";
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

	var computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);
	
	this.color 		= COLOR.energyBarSlot;
	this.width 		= App.Player.energy * visualCoefficient;
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

	var computedX = (Canvas.width * 0.5) - (App.Player.energy * 0.5 * visualCoefficient);

	this.color 		= COLOR.energyBar;
	this.width 		= App.Player.energy * visualCoefficient;
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

	if(App.difficulty != "lazy") {
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

	if(App.Host.deathFlags.length > 0) {
		// At least one person has died, that means that we have the two deathFlags
		if(App.Host.deathFlags[0]["AVG(duration)"]){
			// Mean deaths
			var deathFlag = new DeathFlag(0);
			canvasDeathFlags.push(deathFlag);
		}
		if(time == App.Host.deathFlags[1]["duration"]) {
			// Furthest death
			var deathFlag = new DeathFlag(1);
			canvasDeathFlags.push(deathFlag);
		}

	}

	

	time++;

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
	
	// Set score view
	// document.querySelector("#artefactsToTake").innerHTML = App.Player.artefactsToTake.length;
	document.querySelector("#artefactsToTake").innerHTML = App.Player.energy;

	myGameArea.start();

	player = new Player();
	console.log(App.difficulty);
	if(App.difficulty != "lazy") {
		// Handle energyBar only if ht edifficulty is easy or crazy
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

	// ******************** Player movement on key events ******************** //

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
				player.slot = 0;
				break;
			case 90:
				// Midtop
				App.Player.position = 1;
				player.slot = 1;
				break;
			case 69:
				// Midbot
				App.Player.position = 2;
				player.slot = 2;
				break;
			case 82:
				// Bot
				App.Player.position = 3;
				player.slot = 3;
				break;
			case 38:
				// Up arrow
				if(App.Player.position != 0) {
		
					App.Player.position--;
					player.slot -= 1;
				}
				break;
			case 40:
				// Down arrow
				if(App.Player.position != 3) {
		
					App.Player.position++;
					player.slot += 1;
				}
				break;
		}
	}

	// ******************** Player movement on click events ******************** //

	//  Adapt the click coordinates to the canvas
	x = e.pageX - rect.left;
	y = e.pageY - rect.top;

	if (x > 0 && x < Canvas.width && y > 0 && y < Canvas.height) {
		for (var i = 0; i < 4; i++) {
			if(buttons[i].clicked(y) == true) {
				App.Player.position = i;
				player.slot = i;
			}
		}
	}
	
	// ******************** Notify websocket ******************** //
	App.Player.onMove(App.Player.position);
}



function updateGameScene(data) {
	var gameState = data; // Dirty, back should send data, not data.data
	// gameState is so : { energy: 163, isArtefactTaken: false, nbArtefacts: null, bar: 31 }
	console.log(data);

	if(App.difficulty != "lazy") {
		// Handle energy
		energyBar.width = gameState.energy * visualCoefficient; // TODO this should be done in .update()
		energyBarSlot.update();
		energyBar.update();
	}

	// Update score
	document.querySelector("#artefactsTaken").innerHTML = App.Player.takenArtefactsCount;

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
	console.log(data);
	if(data.win) {
		// document.querySelector("#gameState").innerHTML = "Congrats, you gathered all the artefacts!";
		// document.querySelector("#gameState").innerHTML = App.Player.artefactsTaken.length
		document.querySelector("#gameState").innerHTML = data.score;
	} else {
		// document.querySelector("#gameState").innerHTML = "You gathered " + App.Player.artefactsTaken + " out of " + App.Player.energy + " artefacts!";
	}
	// Show pop up
	document.querySelector("#endGameLayer").classList.remove("hidden");
	// Blur canvas
	document.querySelector("#canvasWrapper").classList.add("blurred");
}