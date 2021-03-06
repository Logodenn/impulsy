// ******************** Canvas setup ******************** //

var blocUnit = 0;
var visualCoefficient = 50;
var pulserWidth = 165;
const imgPath = "../img/canvas/";
var started = 0;

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


// ******************** Colors ******************** //

var COLOR = {
	energyBar		: "#FAC32C",
	energyBarSlot	: "#716383",
	pulsers			: "#b928bd"
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
var players 			= [];
var energyBar;
var pulsers 			= [];
var leftBorder			= null;
var canvasBars 			= [];
var canvasArtefacts 	= [];
var canvasArtefactsCoop	= [];
var canvasDeathFlags  	= [];
var buttons				= [];

// ******************** Images ******************** //

// var imgArtefact = new Image();
// imgArtefact.src = imgPath + "artefact.png";

var imgArtefactTaken = new Image();
imgArtefactTaken.src = imgPath + "artefactTaken.png";

// ******************** Player ******************** //


/**
* Class to display a player
*
* @class Player
* @constructor
* @param {Object} definition object contening positions on the x and y axes
*/
function Player(definition) {
	var self = this;
	self.img		= "unicorn-2"
	self.state		= 2;
	self.cpt		= 0;
	self.posX 		= 4 * blocUnit;
	self.posY 		= Positions[definition.position.y];
	self.y			= definition.position.y;
	self.x			= definition.position.x;
	self.number		= definition.number;
	self.update 	= function() {
		if(started){
			self.posX 	= canvasBars[self.x].x - blocUnit/2;
			self.img 		= "player" + self.number;
		} else {
			self.cpt	+= 1;
			self.posX 	= self.cpt * (4 * blocUnit / 427);
			if(self.cpt % 20 == 0){
				self.state  = (self.state == 3) ? 2 : 3;
			}
			self.img	= "unicorn" + self.state;
		}
		self.posY 		= Canvas.topSlot + self.y * blocUnit;
		ctx = myGameArea.context;
		ctx.drawImage(imageLoader.images[self.img], self.posX, self.posY, blocUnit, blocUnit);
	}
	self.ctx = myGameArea.context;

	self.update()
}

// ******************** Pulsers ******************** //
/**
* Class to display a pulser
*
* @class Pulser
* @constructor
* @param {int} i index from 0 to 3 to determine the y position
*/
function Pulsers(i) {
	var self 		= this;
	self.index		= i;
	self.x 			= myGameArea.canvas.width - blocUnit;
	self.y 			= Canvas.topSlot + self.index * blocUnit;
	self.update 	= function() {
		self.x 			= myGameArea.canvas.width - blocUnit;
		self.y 			= Canvas.topSlot + self.index * blocUnit;
		ctx = myGameArea.context;
		ctx.drawImage(imageLoader.images.pulser, self.x, self.y, blocUnit, blocUnit);
	}
	self.ctx = myGameArea.context;
	
	self.update()
}

// ******************** Left Border ******************** //
/**
* Class to display the left border
*
* @class LefBorder
* @constructor
*/
function LeftBorder() {
	var self 		= this;
	self.x 			= 0;
	self.y 			= Canvas.topSlot;
	self.width 		= blocUnit / 9;
	self.height		= blocUnit * 4;
	self.ctx = myGameArea.context;
	self.update 	= function() {
		ctx 			= myGameArea.context;
		ctx.fillStyle 	= COLOR.pulsers;
		ctx.fillRect(self.x, self.y, self.width, self.height);
	}
	self.update()
}

// ******************** Start game messages ******************** //
function Message(){
	var self = this;
	self.posX = blocUnit;
	self.posY = Canvas.middleBotSlot;
	self.cpt = 0;
	self.update 	= function() {
		self.cpt += 1;
		ctx = myGameArea.context;
		if(self.cpt * (4 * blocUnit / 427) < blocUnit){
			ctx.drawImage(imageLoader.images.message1, self.posX, self.posY, 2*blocUnit, 2*blocUnit);
		} else if(self.cpt * (4 * blocUnit / 427) < 3*blocUnit & self.cpt * (4 * blocUnit / 427) > 2*blocUnit) {
			ctx.drawImage(imageLoader.images.message1, self.posX, self.posY, 2*blocUnit, 2*blocUnit);
		} else if(self.cpt * (4 * blocUnit / 427) > 4*blocUnit & self.cpt * (4 * blocUnit / 427) < 6*blocUnit) {
			ctx.drawImage(imageLoader.images.message2, self.posX, self.posY, 2*blocUnit, 2*blocUnit);
		}
	}
	self.ctx = myGameArea.context;
}

// ******************** Death flags ******************** //
/**
* Class to display a death flag
*
* @class Player
* @constructor
* @param {int} type 0 to display an avarage death flag or 1 to display a best score death flag
*/
function DeathFlag(type) {
	var self 		= this;
	self.x 			= myGameArea.canvas.width - 2 * blocUnit;
	//self.y 			= Canvas.botSlot;
	self.y 			= Canvas.deathFlags;
	self.cpt		= 0;
	self.update 	= function() {
		self.cpt 		+= 1;
		self.y 			= Canvas.deathFlags;
        self.x 			= myGameArea.canvas.width - 2 * blocUnit - self.cpt * (3.5 * blocUnit / 400);
		ctx 			= myGameArea.context;

		var imageName = type == 0 ? "deathFlagsAverage" : "deathFlagBest";
		ctx.drawImage(imageLoader.images[imageName], self.x, self.y, blocUnit, blocUnit);
	}

	self.ctx = myGameArea.context;
	self.update()
}


// ********************* Button ********************* //
/**
* Class to create a button area
*
* @class Button
* @constructor
* @param {int} y index from 0 to 3 to determine the y position
*/
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
	//   console.log(mytop, mybottom);
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
/**
* Class to display an artefact
*
* @class Artefact
* @constructor
* @param {int} i index from 0 to 3 to determine the y position
* @param {int} playerNumber 0 or 1 to determine the player associated to the artefact
*/
function Artefact(slot, playerNumber) {
	var self 		= this;
	self.isArtefactTaken	= false;
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

		if (self.isArtefactTaken) {
			ctx.drawImage(imageLoader.images.artefactTaken, self.x, self.y, blocUnit, blocUnit);
		} else {
			ctx.drawImage(imageLoader.images["artefact" + playerNumber], self.x, self.y, blocUnit, blocUnit);
		}
	}
	self.isTaken = function() {
		self.isArtefactTaken = true;
	}
	self.ctx = myGameArea.context;
	ctx.drawImage(imageLoader.images["artefact" + playerNumber], self.x, self.y, blocUnit, blocUnit);
}

// ******************** Amplitude ******************** //
/**
* Class to display an amplitude
*
* @class Amplitude
* @constructor
* @param {Object} barDefinition informations related to the bar
*/
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
/**
* Class to display an energy bar slot
*
* @class EnergyBarSlot
* @constructor
*/
function EnergyBarSlot() {	
	this.color 		= COLOR.energyBarSlot;
	this.width 		= blocUnit * 6;
	this.height 	= blocUnit * 0.3;
	this.x			= (Canvas.width * 0.5) - blocUnit * 3;
	this.y 			= blocUnit * 0.5;
	this.update 	= function() {
		this.width 		= blocUnit * 6;
		this.height 	= blocUnit * 0.3;
		this.x			= (Canvas.width * 0.5) - blocUnit * 3;
		this.y 			= blocUnit * 0.5;
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.ctx 			= myGameArea.context;
	this.ctx.fillStyle 	= this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

// ******************** EnergyBar ******************** //
/**
* Class to display the energy bar
*
* @class EnergyBar
* @constructor
*/
function EnergyBar() {	
	this.color 		= COLOR.energyBar;
	this.width 		= blocUnit * 6;
	this.height 	= blocUnit * 0.3;
	this.x			= (Canvas.width * 0.5) - blocUnit * 3;
	this.y 			= blocUnit * 0.5;
	this.energyBarCoefficient = this.width / App.Host.energy;
	this.update 	= function() {
		this.width 		= App.Host.energy * this.energyBarCoefficient;
		this.height 	= blocUnit * 0.3;
		this.x			= (Canvas.width * 0.5) - blocUnit * 3;
		this.y 			= blocUnit  * 0.5;
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
/**
* Class to display an energy bar slot
*
* @class EnergyBarSlot
* @constructor
*/
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
		setTimeout(function() {started = 1;}, 4270);
		this.intervalAddAmplitude 	= setInterval(addAmplitudeAndArtefact,500);
		this.intervalUpdate 		= setInterval(updateGameArea, 10);

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

/**
* Update the game by clearing the canvas and call the update method of all the objects displayed
*
* @method updateGameArea
*/
function updateGameArea() {
	myGameArea.clear();

	for (i = 0; i < canvasBars.length; i++) {
		canvasBars[i].update();
		canvasArtefacts[i].update();
		if(App.mode == "coop") {
			canvasArtefactsCoop[i].update();
		}
	}

	for (i = 0; i < pulsers.length; i++) {
		pulsers[i].update();
	}

	leftBorder.update();

	for (i = 0; i < canvasDeathFlags.length; i++) {
		canvasDeathFlags[i].update();
	}

	for (i = 0; i < players.length; i++) {
		players[i].update();
	}

	if(App.difficulty != "lazy") {
		energyBarSlot.update();
		energyBar.update();
	}

	startGameMessage.update();
}

/**
* Display a new bar from the spectrum and it artefact(s) associated
*
* @method addAmplitudeAndArtefact
*/
function addAmplitudeAndArtefact() {
	// console.log(App.Host.audioSpectrum[time]);
	var amplitude  = new Amplitude(App.Host.audioSpectrum[time]);
	canvasBars.push(amplitude);

	var artefact = new Artefact(App.Host.audioSpectrum[time].artefacts[App.Player.number], App.Player.number);
	canvasArtefacts.push(artefact);

	if(App.mode == "coop") {
		var otherPlayer = App.Player.number == 0 ? 1 : 0;
		 
		var artefactCoop = new Artefact(App.Host.audioSpectrum[time].artefacts[otherPlayer], "Coop");
		canvasArtefactsCoop.push(artefactCoop);
	}

	if(App.mode == "solo") {

		// Average death
		if(App.Host.deathFlags[0]) {	
			if(time == App.Host.deathFlags[0]["AVG(duration)"]){
				var deathFlag = new DeathFlag(0);
				canvasDeathFlags.push(deathFlag);
			}
		}
		// Best death
		if (App.Host.deathFlags[1]) {
			if(time == App.Host.deathFlags[1]["duration"]) {
				var deathFlag = new DeathFlag(1);
				canvasDeathFlags.push(deathFlag);
			}
		}
	}

	time++;

	if(time >= App.Host.audioSpectrum.length) {
		myGameArea.stopAddition();		
	}
}

/**
* Update the blocunit value and all the associated variables 
*
* @method updateBlocUnit
* @param canvasWidth current width of the canvas 
*/
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
}

// ****************************************************************************************************** //
// **************************************** GAME INITIALIZATION **************************************** //
// **************************************************************************************************** //

/**
* Update the blocunit value and all the associated variables 
*
* @method updateBlocUnit
* @param canvasWidth current width of the canvas 
*/
function startGame() {
	// Hide buttons
	document.querySelector("#roomMetadata").classList.add("hidden");
	document.querySelector("#startButtons").classList.add("hidden");
	document.querySelector("#invite").classList.add("hidden");
	// Display score
	document.querySelector("#score").classList.remove("hidden");
	
	// Set score view
	// document.querySelector("#artefactsToTake").innerHTML = App.Player.artefactsToTake.length;
	// document.querySelector("#artefactsToTake").innerHTML = App.energy;
	document.querySelector("#artefactsTaken").innerHTML = 0;
	document.querySelector("#artefactsToTake").innerHTML = App.Host.energy;

	myGameArea.start();

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
	
	leftBorder = new LeftBorder();

	startGameMessage = new Message();

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
				App.Player.onMove(0, players[App.Player.number].x);

				break;
			case 90:
				// Midtop
				App.Player.onMove(1, players[App.Player.number].x);

				break;
			case 69:
				// Midbot
				App.Player.onMove(2, players[App.Player.number].x);

				break;
			case 82:
				// Bot
				App.Player.onMove(3, players[App.Player.number].x);

				break;
			case 38:
				// Up arrow
				App.Player.onMove(players[App.Player.number].y - 1, players[App.Player.number].x);

				break;
			case 40:
				// Down arrow
				App.Player.onMove(players[App.Player.number].y + 1, players[App.Player.number].x);

				break;
			case 37:
				// Left arrow
				App.Player.onMove(players[App.Player.number].y, players[App.Player.number].x - 1);
	
				break;
			case 39:
				// Rigth arrow
				App.Player.onMove(players[App.Player.number].y, players[App.Player.number].x + 1);

				break;
		}
	}
	
	// ******************** Player movement on click event ******************** //
	
	window.onclick = function(e) {
		// Get the canvas's positions
		var rect = myGameArea.canvas.getBoundingClientRect();
		var speedX;
	
		//  Adapt the click coordinates to the canvas
		x = e.pageX - rect.left;
		y = e.pageY - rect.top;
		// console.log(x, y)
		if (x > 0 && x < Canvas.width && y > 0 && y < Canvas.height) {
			for (var i = 0; i < 4; i++) {
				if(buttons[i].clicked(y) == true) {
					if(x < (players[App.Player.number].posX - blocUnit/2)) {
						speedX = -1;
					} 
					else if(x > (players[App.Player.number].posX + 1.5*blocUnit)) {
						speedX = 1;
					} else {
						speedX = 0;
					}

					//App.Players[App.Player.number].y = i;
					//players[App.Player.number].slot = i;
					App.Player.onMove(i, players[App.Player.number].x + speedX);
				}
			}
		}

		// ******************** Notify websocket ******************** //
		//App.Player.onMove();
	}
}

function resetGame() {
	// Maybe we should create a GameArray object that allows to loop over its arrays to reset them dynamically
	players 			= []
	pulsers 			= []
	leftBorder			= null;
	buttons 			= []
	canvasBars 			= [];
	canvasArtefacts 	= [];
	canvasArtefactsCoop	= [];
	canvasDeathFlags  	= [];
	time				= 0
	started = 0

	// console.log("Below is value of var myGameArea");
	// console.log(myGameArea);

	myGameArea.stop()
	myGameArea.stopAddition()
}

function updateGameScene(data) {
	var gameState = data; // Dirty, back should send data, not data.data
	// gameState is so : { energy: 163, isArtefactTaken: false, nbArtefacts: null, bar: 31 }

	if(App.difficulty != "lazy") {
		// Handle energy
		// energyBar.width = gameState.energy * energyBarCoefficient;
		// energyBar.width = gameState.energy * visualCoefficient;
		energyBarSlot.update();
		energyBar.update();
	}

	document.querySelector("#artefactsTaken").innerHTML = data.takenArtefactsCount;

	// Handle artefact checking
	if(gameState.isArtefactTaken) {
		// App.Player.artefactsTaken.push(App.Player.artefactsToTake[gameState.bar]);
		// Update artefact visual
		if (App.Player.number === gameState.playerNumber) {
			canvasArtefacts[gameState.bar].isTaken()
		} else {
			canvasArtefactsCoop[gameState.bar].isTaken()
		}
	}
}

window.onresize = function() {
	myGameArea.canvas.width 	= window.innerWidth * 0.8;
	myGameArea.canvas.height 	= myGameArea.canvas.width * 0.6;
	
	updateBlocUnit(myGameArea.canvas.width);

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].update();
		// console.log("button updated");
	} 
}

function updateScore() {
	// Write score in view
	// document.querySelector("#artefactsTaken").innerHTML = App.Player.artefactsTaken.length;
	document.querySelector("#artefactsTaken").innerHTML = "hey dude";
	// TODO
}

function endGame (data) {
	// Handle energyBar only if the difficulty is easy or crazy
	if(App.difficulty != "lazy") {
	
		// Dirty dirty dirty fix
		energyBar.width = 0; // Otherwirse we don't recieve the last energy loss, so we have a yellow part that still holds on
		energyBar.update();
	}

	// if(data.win) {
		// document.querySelector("#gameState").innerHTML = "Congrats, you gathered all the artefacts!";
		// document.querySelector("#gameState").innerHTML = App.Player.artefactsTaken.length
	document.querySelector("#gameState").innerHTML = data.score;
	// } else {
		// document.querySelector("#gameState").innerHTML = "You gathered " + App.Player.artefactsTaken + " out of " + App.Host.energy + " artefacts!";
	// }

	// Taunt on social media
	document.querySelector("#tauntFacebook").innerHTML = '<a href="/share?service=facebook&title=I got a score of '+data.score+' in Impulsy! Can you do better? Come and play! http://impulsy.fr&url='+window.location.href+' target="_blank"><button class="button button-small" state="passive"><img src="../img/trololof.svg" alt="Facebook Logo" width="30px" height="30px"></button></a>'                	
	document.querySelector("#tauntTwitter").innerHTML = '<a href="/share?service=twitter&title=I got a score of '+data.score+' in Impulsy! Can you do better? Come and play! http://impulsy.fr&url='+window.location.href+' target="_blank"><button class="button button-small" state="passive"><img src="../img/trololot.svg" alt="Twitter Logo" width="30px" height="30px"></button></a>'                	
	

	// Show pop up
	document.querySelector("#endGameLayer").classList.remove("hidden");
	// Blur canvas
	document.querySelector("#canvasWrapper").classList.add("blurred");
}
