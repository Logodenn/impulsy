//var orm = require("orm");


module.exports = function(orm, db)
{
    var User = db.define('user', {
        pseudo : { type : 'text' , key: true},
        password: String,
        rank: Number
    });
};

/*
function testInsertUserDB() {
    var pseudo = 'john'
    user({pseudo: pseudo, password: "Doeufr", rank: 29}, 'insert', function (results) {
        if (results == 0) {
            //user({pseudo: pseudo}, 'delete', function (results) {
                if (results == 0) {
                    console.log('0');
                    return true;
                } else {
                    console.log('1');
                    return false;
                }
            //});
        } else {
            console.log('1');
            return false;
        }
    });
}


testInsertUserDB();*/

