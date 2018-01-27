

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
                IO.startGame();
			}
        },

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
            App.Host.energy             = game.energy;
            
            // Players
            App.Players                 = game.players.slice(0);
            App.Player.number           = game.playerNumber;
            App.Player.takenArtefactsCount = 0;

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

		onMove : function() {
            // Notify WS
            var data = {
                number: App.Player.number,
                y: App.Players[App.Player.number].position.y,
                x: App.Players[App.Player.number].position.x
            }
            console.log("Envoi onMove : ",data);
            IO.playerMove(data);
            // player.update();
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
    var gameData = {
        roomId      : App.gameId,
        trackId     : App.Host.trackId,
        difficulty  : App.difficulty,
        mode        : App.mode
    }
    IO.playAgain(gameData)
}
