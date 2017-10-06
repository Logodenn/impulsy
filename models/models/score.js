var orm = require('orm');

module.exports = function(orm, db)
{
    var Score = db.define("score", {
        date : { type : 'text' , key: true},
        //user_pseudo : { type : 'text' , key: true},
        duration       : Number
        //track_name      : String,
        //track_link  :String
    });
};