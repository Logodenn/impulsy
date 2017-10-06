var orm = require("orm");

module.exports = function(orm, db)
{
    var Track = db.define("track", {
        name: {type : 'text' , key: true},
        link: {type : 'text' , key: true}
    });
};

/*
function testTrackDB() {
    var name = 'Show must go on';
    sound({name: name, spectrumLink: "localhost/home/1232"}, 'delete', function (results) {
        if (results == 0) {
            sound({name: name}, 'delete', function (results) {
                if (results == 0) {
                    console.log('0');
                    return true;
                } else {
                    console.log('1');
                    return false;
                }
            });
        } else {
            console.log('1');
            return false;
        }
    });
}

testTrackDB();
*/
