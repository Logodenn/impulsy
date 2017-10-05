//var orm = require("orm");


module.exports = function(orm, db)
{
    var User = db.define('user', {
        pseudo : { type : 'text' , key: true},
        password: String,
        rank: Number
    });
};

/*function user(user, operation, callback) {
    orm.connectAsync('mysql://root:1234@localhost/mydb')
        .then(function (db) {
            // connected
            var User = db.define("user", {
                    pseudo: String,
                    password: String,
                    rank: Number
                }
            );
            User.sync(function (err) {
                if (operation == 'insert') {
                    User.createAsync(user)
                        .then(function () {
                            console.log("user : " + user.pseudo + " created");
                            callback(0);
                        }).catch(function (err) {
                        console.error('Creation error for user : ' + user.pseudo + '' + err);
                        callback(1);
                    });
                } else if (operation == 'delete') {
                    User.findAsync({pseudo: user.pseudo})
                        .then(function (results) {

                            console.log("user : " + results[0].pseudo);
                            results[0].removeAsync();
                        }).then(function () {
                        console.log("deleted !!");
                        callback(0)
                    }).catch(function (err) {
                        console.error('Creation error for user : ' + user.pseudo + '' + err);
                        callback(1);
                    });
                } else if (operation == 'update') {
                    User.findAsync({pseudo: user.pseudo})
                        .then(function (results) {

                            console.log("user : " + results[0].pseudo);

                            results[0].password = user.password;
                            results[0].rank = user.rank;
                            results[0].saveAsync();
                        }).then(function () {
                        console.log("saved !!");
                        callback(0);
                    }).catch(function (err) {
                        console.error('Creation error for user : ' + user.pseudo + '' + err);
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

