

// ******************** App ******************** //

/**
 * App object handles every element needed for the game logic.
 */
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

    // Event handlers
    bindEvents: function () {},

	// ********** Host ********** //
    Host : {

        players : [],
        trackId: "ttEI35HVpqI",
        difficulty: "lazy",

        /**
         * Start the game if it is startable
         * @function
         */
		clickStart: function () {
			if(document.querySelector("#startGameButton").attributes.state.value != "disabled") {
                IO.startGame();
			}
        },

        /**
         * Initialize the game with its metadata and latency
         * @function
         * @param {*} data 
         */
        gameInit: function (data) {

            //TODO handle if playAgain
            if(document.querySelector("#startButtons").classList.contains("hidden")) {

                // Display buttons
                document.querySelector("#startButtons").classList.remove("hidden");
                // Hide score
                document.querySelector("#score").classList.add("hidden");
                // Hide pop up
                document.querySelector("#endGameLayer").classList.add("hidden");
                // Unblur canvas
                document.querySelector("#canvasWrapper").classList.remove("blurred");
                document.querySelector("#canvasWrapper").innerHTML = "";
            }

            var game    = data.gameMetadata;
            var latency = data.latency;

            // Settings
			App.myRole      = 'Host';
            App.latency     = latency;
            App.trackId     = game.spectrum.id;
            App.mode        = game.mode;
            App.difficulty  = game.difficulty;
            
            // Logic
            App.Host.audioSpectrum 	    = game.spectrum.bars.slice(0);
            App.Host.deathFlags         = game.spectrum.deathFlags.slice(0);
            App.Host.energy             = game.energy;
            
            // Players
            App.Players                 = game.players.slice(0);
            App.Player.number           = game.playerNumber;
            App.Player.takenArtefactsCount = 0;

            // Wait for another player if coop
            if(App.mode == "coop") {
                document.querySelector("#waitingRoomMessage").innerHTML = "Waiting for a second player...";
                document.querySelector("#inviteMessage").classList.remove("hidden");
                document.querySelector("#inviteFacebook").innerHTML = '<a href="/share?service=facebook&title=Join Me!&url='+window.location.href+'" target="_blank"><button id="inviteButton" class="button button-small" state="passive"><img src="../img/trololof.svg" alt="Facebook Logo" width="30px" height="30px"></button></a>';                
                document.querySelector("#inviteTwitter").innerHTML = '<a href="/share?service=twitter&title=Join Me!&url='+window.location.href+'" target="_blank"><button id="inviteButton" class="button button-small" state="passive"><img src="../img/trololot.svg" alt="Twitter Logo" width="30px" height="30px"></button></a>';                
            } else {
                document.querySelector("#startGameButton").attributes.state.value = "passive";
            }
        }
	},

	// ********** Player ********** //
    Player : {

        // position: 1,
        // This Player object is used to transit data through the WS

        /**
         * Notify the WS that the player has moved
         * @function
         * @param {*} vY 
         * @param {*} vX 
         */
		onMove : function(vY, vX) {
            // Notify WS
            var data = {
                number: App.Player.number,
                y: vY,
                x: vX
            }

            IO.playerMove(data);
        },
        
        /**
         * Notify the WS that the player has not moved but its position is still right
         * @function
         * @param {*} data 
         */
        onEnergy : function(data) {
            // Notify WS
            IO.playerMove(App.Player.position);
            // IO.socket.emit('playerMove', {playerPosition: App.Player.position});
		}
	}
};

App.init();

/**
 * Add the just-played track to the player's favorites
 * @function
 * @param {*} button 
 */
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

/**
 * Restart the same game with the same metadata
 * @function
 */
function playAgain() {
    var gameData = {
        roomId      : App.gameId,
        trackId     : App.Host.trackId,
        difficulty  : App.difficulty,
        mode        : App.mode
    }
    IO.playAgain(gameData)
}
