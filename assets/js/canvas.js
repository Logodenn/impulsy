// *********************************************************************************************** //
// **************************************** CANVAS SETUP **************************************** //
// ********************************************************************************************* //

var COLOR = {
	energyBar		: "#FAC32C",
	energyBarSlot	: "#716383"
}

var blocUnit = 100;
var visualCoefficient = 4;

var smallBar = {
    height  : blocUnit * 2,
    width   : blocUnit / 4,
    position: null
}

var bigBar = {
    height  : smallBar.height * 2,
    width   : blocUnit / 4,
    position: null
}

var energyBar = {
    height  : blocUnit / 4,
    width   : null,
    position: blocUnit,
    // color   : "#FFD51D",
}

var Canvas = {    
    width	: 10 * blocUnit,
    height	: bigBar.height + energyBar.height + 3 * blocUnit, // Height = biggest bar + energy bar + margins
    // height  : 8 * blocUnit
}

// To make it full dynamic, set the following parameters here
bigBar.position     = energyBar.position + energyBar.height + blocUnit;
smallBar.position   = bigBar.position + bigBar.height / 4
// energyBar.width     = 8 * blocUnit;

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

var time = 0;

// ******************** Components ******************** //

var player;
var pulsers 		= [];
var listeBarres 	= [];
var listeArtefacts 	= [];

// ******************** Images ******************** //

var imgArtefact = new Image();
imgArtefact.src = "../img/artefact.png";

var imgArtefactTaken = new Image();
imgArtefactTaken.src= "../img/artefactTaken.png";

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

	self.isTaken = function() {
		self.img = imgArtefactTaken;
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

// ******************** EnergyBarSlot ******************** //

function EnergyBarSlot() {

	var computedX = (Canvas.width * 0.5) - (App.Player.artefacts.length * 0.5 * visualCoefficient);
	
	this.color 		= COLOR.energyBarSlot;
	this.width 		= App.Player.artefacts.length * visualCoefficient;
	this.height 	= energyBar.height;
	// this.x 			= Canvas.width / 10;
	this.x			= computedX;
	this.y 			= energyBar.position;
	this.update 	= function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		// this.x = (Canvas.width * 0.5) - (this.width * 0.5); // TODO
		// console.log((Canvas.width * 0.5) - (this.width * 0.5));
		// console.log("Slot posX: " + this.x + " width " + this.width);
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.ctx 			= myGameArea.context;
	this.ctx.fillStyle 	= this.color;
	this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

// ******************** EnergyBar ******************** //

function EnergyBar() {

	var computedX = (Canvas.width * 0.5) - (App.Player.artefacts.length * 0.5 * visualCoefficient);

	this.color 		= COLOR.energyBar;
	this.width 		= App.Player.energy * visualCoefficient;
	this.height 	= energyBar.height;
	// this.x 			= Canvas.width / 10;
	this.x			= computedX;
	this.y 			= energyBar.position;
	this.update 	= function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		// this.x = (Canvas.width * 0.5) - (this.width * 0.5);
		// console.log((Canvas.width * 0.5) - (this.width * 0.5));
		// this.width = App.Player.energy * visualCoefficient; TODO this line should be used but App.Player.energy is not refreshed
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

	for (i = 0; i < listeBarres.length; i++) {
		listeBarres[i].update();
		listeArtefacts[i].update();
	}

	for (i = 0; i < pulsers.length; i++) {
		pulsers[i].update();
	}

	if(App.Host.difficulty != "lazy") {
		energyBarSlot.update();
		energyBar.update();
	}
	player.update();
}

function addAmplitudeAndArtefact() {
	var amplitude  = new Amplitude(App.Player.audioSpectrum[time]);
	listeBarres.push(amplitude);

	var artefact = new Artefact(bigBar.position + App.Player.artefactsToTake[time] * blocUnit);
	listeArtefacts.push(artefact);

	time++;

	if(time > App.Player.artefactsToTake.length) {
		myGameArea.stopAddition();
	}
}

// ****************************************************************************************************** //
// **************************************** GAME INITIALIZATION **************************************** //
// **************************************************************************************************** //

function startGame() {
	
	// Set score view
	document.querySelector("#artefactsToTake").innerHTML = App.Player.artefactsToTake.length;

	myGameArea.start();

	player = new Player();

	if(App.Host.difficulty != "lazy") {
		// Handle energyBar only if ht edifficulty is easy or crazy
		energyBarSlot 	= new EnergyBarSlot();
		energyBar		= new EnergyBar();
	}

	for (var i = 0; i < 4; i++) {
		var pulser = new Pulsers(bigBar.position + i * blocUnit);
		pulsers.push(pulser);
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
		// console.log(player.y);
		App.Player.onMove(App.Player.position);
	}
}

function updateGameScene(data) {
	var gameState = data.data; // Dirty, back should send data, not data.data
	// gameState is so : { energy: 163, isArtefactTaken: false, nbArtefacts: null, bar: 31 }

	if(App.Host.difficulty != "lazy") {
		// Handle energy
		energyBar.width = gameState.energy * visualCoefficient; // TODO this should be done in .update()
		energyBarSlot.update();
		energyBar.update();
	}

	// Handle artefact checking
	// if(gameState.isArtefactTaken) {
	if(gameState.isArtefactTaken) {
		
		App.Player.artefactsTaken.push(App.Player.artefactsToTake[gameState.bar]);
		// console.log("Nb of taken artefact : " + App.Player.artefactsTaken.length);

		// Write score in view
		document.querySelector("#artefactsTaken").innerHTML = App.Player.artefactsTaken.length;

		// Update artefact visual
		listeArtefacts[gameState.bar].isTaken()
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
	console.log(player.y);
	App.Player.onMove(App.Player.position);
}

function endGame (data) {
	// TODO pop un filter du endGame
	if(data.result == "victory") {
		// document.querySelector("#gameState").innerHTML = "Congrats, you gathered all the artefacts!";
		document.querySelector("#gameState").innerHTML = App.Player.artefactsTaken.length
	} else {
		// document.querySelector("#gameState").innerHTML = "You gathered " + App.Player.artefactsTaken + " out of " + App.Player.artefacts.length + " artefacts!";
	}
	// Show pop up
	document.querySelector("#endGameLayer").classList.remove("hidden");
	// Blur canvas
	document.querySelector("#canvasWrapper").classList.add("blurred");
}







var newCanvas;
function ArtefactBis(definition) {

	console.log()

	this.canvas = newCanvas;

	if(definition.artefacts.length == 1) {

		this.width = 10;
		this.height = 10;
	
		this.x = 20 * definition.id + 5; // 5 = margin
		console.log(this.position);
		this.y = 20 * (this.position + 1);
		
		this.player = 1;
	
		ctx = this.canvas.getContext("2d");
		ctx.fillStyle = "#716383";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	
}

function Bar(definition) {

	this.canvas = newCanvas;

	this.width = 10;
	this.height = 100 * definition.amplitude;

	this.x = 20 * definition.id + 5; // 5 = margin
	this.y = 20;

	ctx = this.canvas.getContext("2d");
	ctx.fillStyle = "#FAC32C";
	ctx.fillRect(this.x, this.y, this.width, this.height);
	
	if(definition.slots == 4 || definition.slots == 2) {
		new ArtefactBis(definition);
	}
}

function getAmplitudesFromBack() {

	// Set canvas

	newCanvas = document.createElement("canvas");

	newCanvas.width = 500;
	newCanvas.height = 200;

	var ctx = newCanvas.getContext("2d");

	document.querySelector("#caca").appendChild(newCanvas);

	// Back
	
	var spectrum = [];
	var mode = "solo"

	for (var i = 0; i < 8; i++) {

		var amplitude = Math.random();
		var slots;
		var artefact;

		if (amplitude > 0.6) {
			// Les artefacts ont 4 positions possibles
			slots = 4;
		} else if (amplitude <= 0.6 && amplitude > 0.1) {
			// Les artefacts ont 2 positions possibles
			slots = 2;
		} else {
			// Pas d'artefact car <= 0.1
			slots = 0;
		}

		switch (slots) {
			case 4:
				min = 0;
				max = 3;
				this.position = Math.trunc(Math.random() * (max - min) + min);
				break;
			case 2:
				min = 1;
				max = 2;
				this.position = Math.trunc(Math.random() * (max - min) + min);
				break;
			default:
				this.position = null;
		}

		
	
		if(this.position) {
			if(mode != "cooperation") {

				artefact = {
					player: 1,
					position: this.position
				}
			}
		}

		var bar = {
			amplitude: amplitude,
			slots: slots,
			id: i,
			artefacts: []
		}

		bar.artefacts.push(artefact);

		spectrum.push(bar)

	}

	// Front

	for(var obj of spectrum) {
		// console.log(obj);		
		new Bar(obj);
	}

	console.log(spectrum)

}
