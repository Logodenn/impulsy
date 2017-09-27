// var model = {
// 	gameName	: "Impulsy",
// 	catchPhrase	: "Ride the music!"
// }

/*var context = {gameName: "Impulsy", catchPhrase: "Ride the music!"};
var html    = template(context);*/

// ******************** Globals ******************** //

var canvas;

var playerPosition = 0;
// Normalized spectrum for Have A Cigar is : [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
var songPositions = [1, 0, 2, 3, 1, 1, 2, 2, 1, 1, 2, 3, 3, 2, 1, 0, 2, 2, 1, 2, 1, 2];

// ******************** Canvas units ******************** //

var blocUnit 		= 20;
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
// ******************** START GAME ******************** //
// *************************************************** //

function startGame() {

	// Should be called by back

	console.log("game started !");

	// ******************** Get key position ******************** //

	window.onkeyup = function(e) {
		
		// TODO: bind with cancas drawing
		fill(COLOR.player);
		rect(left, top, blocUnit, height);

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
	}

	// ******************** Check positions ******************** //

		
}

// *********************************************** //
// ******************** DRAW ******************** //
// ********************************************* //

function drawSpectrum(normalizedSpectrum) {
	// Draw spectrum
	canvas = createCanvas(window.innerWidth, canvasHeight);

	background(0);

	var leftPosition = 0;

	for(var i = 0; i < normalizedSpectrum.length; i++) {

		// ******************** Bars ******************** //

		var left = leftPosition + blocUnit * i;
		var top;

		// Set top and height
		if(normalizedSpectrum[i] == 1) {
			// Big bar
			top 	= bigBarTop;
			height 	= bigBarHeight;
		} else {
			// Small bar
			top 	= smallBarTop;
			height 	= smallBarHeight
		}

		// Draw on canvas
  		fill(COLOR.bar);
		rect(left, top, blocUnit, height);

		// ******************** Artefacts ******************** //

		var artefact 	= songPositions[i];
		height 			= blocUnit;

		// Set top
		switch(artefact) {
			case 0:
				top = blocUnit;
				break;
			case 1:
				top = blocUnit * 2;
				break;
			case 2:
				top = blocUnit * 3;
				break;
			case 3:
				top = blocUnit * 4;
				break;
		}

		// Draw on canvas
		fill(COLOR.artefact);
		rect(left, top, blocUnit, height);
	}
}