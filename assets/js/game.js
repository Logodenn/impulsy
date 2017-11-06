
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
        trackId: "3TygesLODpU",
        difficulty: "lazy",

        onDifficultyClick: function (difficulty) {

            // // Reset state
            // document.querySelector("#lazy").attributes.state.value = "passive";
            // document.querySelector("#easy").attributes.state.value = "passive";
            // document.querySelector("#crazy").attributes.state.value = "passive";
            // console.log(difficulty);
            // // Active state
            // document.querySelector("#"+difficulty).attributes.state.value = "active";

            this.difficulty = difficulty;
		},

        onCreateClick: function () {
			if(document.querySelector("#createGameButton").attributes.state.value != "disabled") {
                /*
                // Reset state
                document.querySelector("#lazy").attributes.state.value = "disabled";
                document.querySelector("#easy").attributes.state.value = "disabled";
                document.querySelector("#crazy").attributes.state.value = "disabled";
                
                // Active state
                document.querySelector("#"+this.difficulty).attributes.state.value = "active";
                */
				console.log('Clicked "Create A Game" ' + this.trackId + ' - ' + this.difficulty);
				IO.socket.emit('hostCreateNewGame', {
					youtubeVideoId	: this.trackId,
					difficulty		: this.difficulty
				});
                
				document.querySelector("#createGameButton").attributes.state.value = "disabled";
			}
		},

		onStartClick: function () {
			if(document.querySelector("#startGameButton").attributes.state.value != "disabled") {
				
				console.log('Clicked "Start A Game"');
				IO.socket.emit('hostStartGame');

                // Hide buttons
                document.querySelector("#difficultyButtons").classList.add("hidden");
                document.querySelector("#startButtons").classList.add("hidden");

                // Display score
                document.querySelector("#score").classList.remove("hidden");
			}
        },

        gameInit: function (data) {

            var game    = data.game;
            var latency = data.latency;

			console.log(game);

            // Settings
            App.gameId 				= game.gameId;
			App.mySocketId 			= game.mySocketId;
			App.myRole 				= 'Host';
            App.latency 	        = latency;
            
            // Logic
            App.Player.energy           = game.energy;
			App.Player.position 	    = game.position;
            App.Player.artefacts 	    = game.arrayArtefacts.slice(0);
            App.Player.artefactsToTake 	= game.arrayArtefacts.slice(0);
            App.Player.artefactsTaken   = [];
            App.Player.audioSpectrum 	= game.arraySpectrum.slice(0);

			document.querySelector("#startGameButton").attributes.state.value = "passive";

            console.log("Game initialized with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
	},

	// ********** Player ********** //
    Player : {

        // position: 1,
        // This Player object is used to transit data through the WS

		onMove : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
			IO.socket.emit('playerMove', {playerPosition: App.Player.position});
        },
        
        // In case the player does not move but the position is right
        onEnergy : function(data) {
			console.log('Player moved at position : ' + App.Player.position);
			IO.socket.emit('playerMove', {playerPosition: App.Player.position});
		}
	}
};

App.init();
