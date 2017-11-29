
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

        // Player
    },

	// ********** Host ********** //
    Host : {

        players : [],
        currentCorrectAnswer: '',
        trackId: "ttEI35HVpqI",
        difficulty: "lazy",

		clickStart: function () {
			if(document.querySelector("#startGameButton").attributes.state.value != "disabled") {
				
                console.log('Clicked "Start A Game"');
                IO.startGame();

                // Hide buttons
                //document.querySelector("#difficultyButtons").classList.add("hidden");
                document.querySelector("#startButtons").classList.add("hidden");

                // Display score
                document.querySelector("#score").classList.remove("hidden");
			}
        },

        gameInit: function (data) {

            var game    = data.gameMetadata;
            var latency = data.latency;

            console.log(game);
            // var track =JSON.parse(game.track.replace('j:',''));

            // Settings
			App.myRole      = 'Host';
            App.latency     = latency;
            App.trackId     = game.spectrum.id;
            App.mode        = game.mode;
            App.difficulty  = game.difficulty;
            
            // Logic
            App.Host.audioSpectrum 	    = game.spectrum.bars.slice(0);
            App.Host.deathFlags         = game.spectrum.deathFlags.slice(0);
            App.Player.energy           = game.energy;
            App.Player.position 	    = game.position;
            App.Player.number           = game.playerNumber;
            App.Player.takenArtefactsCount = 0;

			document.querySelector("#startGameButton").attributes.state.value = "passive";
        }
	},

	// ********** Player ********** //
    Player : {

        // position: 1,
        // This Player object is used to transit data through the WS

		onMove : function(data) {
            // Notify WS
            IO.playerMove(App.Player.position);
            // IO.socket.emit('playerMove', {playerPosition: App.Player.position});
            player.update();
        },
        
        // In case the player does not move but the position is right
        onEnergy : function(data) {
            // Notify WS
            IO.playerMove(App.Player.position);
            // IO.socket.emit('playerMove', {playerPosition: App.Player.position});
		}
	}
};

App.init();

function favoriteTrack(button) {

    var action = "/favorite/" + App.trackId;

    // ********** AJAX ********** //

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
        }
    };

    button.attributes.state.value = "disabled"

    xhttp.open("POST", action, true);
    xhttp.send();
}

function playAgain() {

    var action = "/room";
    /*var data = new FormData();
    data.append('trackId', App.Host.trackId.toString());
    data.append('difficulty', App.difficulty.toString());
    data.append('mode', App.mode.toString);*/
    var gameData = {
        trackId     : App.Host.trackId,
        difficulty  : App.difficulty,
        mode        : App.mode
    }
    
    // ********** AJAX ********** //

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(this.responseText);
        }
    };

    xhttp.open("POST", action, true);
    //Send the proper header information along with the request
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(JSON.stringify(gameData.toString));
}
