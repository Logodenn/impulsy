var orm = require("orm");

module.exports = function(orm, db)
{
    var User = db.define("user", {
        name: {type : 'text' , key: true},
        spectrumLink: String
    });
};

/*
function sound(sound, operation, callback) {
    orm.connectAsync('mysql://root:1234@localhost/mydb')
        .then(function (db) {
            // connected
            var Sound = db.define('sound', {
                    name: String,
                    spectrumLink: String
                }
            );
            Sound.sync(function (err) {
                if (operation == 'insert') {
                    Sound.createAsync(sound)
                        .then(function () {
                            console.log("sound : " + sound.name + " created");
                            callback(0);
                        }).catch(function (err) {
                        console.error('Creation error for sound : ' + sound.name + '' + err);
                        callback(1);
                    });
                } else if (operation == 'delete') {
                    Sound.findAsync({name: sound.name})
                        .then(function (results) {
                            console.log("sound : " + results[0].name);
                            results[0].removeAsync();
                        }).then(function () {
                        console.log("deleted !!");
                        callback(0)
                    }).catch(function (err) {
                        console.error('Deletion error for sound : ' + sound.name + '' + err);
                        callback(1);
                    });
                } else if (operation == 'update') {
                    Sound.findAsync({name: sound.name})
                        .then(function (results) {

                            console.log("sound : " + results[0].name);

                            results[0].password = sound.password;
                            results[0].rank = sound.rank;
                            results[0].saveAsync();
                        }).then(function () {
                        console.log("saved !!");
                        callback(0);
                    }).catch(function (err) {
                        console.error('Creation error for sound : ' + sound.name + '' + err);
                        callback(1)
                    });
                }
            });
        })
        .catch(function (err) {
            console.error('Connection error' + err);
            callback(1);
        });
}


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
