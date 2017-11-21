
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
			App.myRole 				= 'Host';
            App.latency 	        = latency;
            
            // Logic
            App.Host.difficulty         = game.difficulty;
            App.Host.audioSpectrum 	    = game.spectrum.bars.slice(0);
            App.Player.energy           = game.energy;
            App.Player.position 	    = game.position;

			document.querySelector("#startGameButton").attributes.state.value = "passive";
        }
	},

	// ********** Player ********** //
    Player : {

        // position: 1,
        // This Player object is used to transit data through the WS

		onMove : function(data) {
            console.log('Player moved at position : ' + App.Player.position);
            // Notify WS
            IO.playerMove(App.Player.position);
            // IO.socket.emit('playerMove', {playerPosition: App.Player.position});
            player.update();
        },
        
        // In case the player does not move but the position is right
        onEnergy : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
            IO.socket.emit('playerMove', {playerPosition: App.Player.position});
            // TODO
            // Don't emit here, use ws.js to emit, just like for the onMove function just above this one
		}
	}
};

App.init();
