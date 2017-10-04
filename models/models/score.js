var orm = require('orm');

module.exports = function(orm, db)
{
    var Score = db.define("score", {
        date : { type : 'text' , key: true},
        user_pseudo : { type : 'text' , key: true},
        duration       : Number,
        track_name      : String
    });
};
/*function create(score){
orm.connectAsync('mysql://root:1234@localhost/mydb')
  .then(function(db) {
      // connected
      var Scores = db.define("scores", {
      		idscores      : Number,
      		date   : String,
      		duration       : Number,
      		users_idusers      : Number,
      		tracks_idtracks      : Number
      	}, {
      		methods: {
      			fullScore: function () {
      				return this.iduser + ' ' + this.email;
      			}
      		}
      	});

        Scores.createAsync(score)
          .then(function(results) {
            console.log("created",);
            console.log("Result: %d", results);
          });
  })
  .catch(function() {
     console.error('Connection error: ' + err);
  });
  }*/
