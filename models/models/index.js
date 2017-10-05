var orm = require('orm');
var settings = require('../config/settings');

var connection = null;

function setup(db, cb) {
    require('./score')(orm, db);
    require('./track')(orm, db);
    require('./user')(orm, db);

    return cb(null, db);
}

module.exports = function (cb) {
    if (connection) return cb(null, connection);

    orm.connect(settings.database, function (err, db) {
        if (err) return cb(err);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);

        db.sync(function (err) {
            if (err) throw err;
        });

        setup(db, cb);
    });
};





/*
checkError = function (cb, err) {
    if (err)
        return cb(err);
    return cb();
}
module.exports = function (db, cb) {
    db.load("./user.js", function (err) {
        //checkError(cb, err)
        console.log(err);
    });

    var User = db.models.user;

    /!*    Alert.hasOne("stop", Stop, {reverse: "alerts"});
        Alert.hasOne("line", Line, {reverse: "alerts"});*!/
    var user = {pseudo: "pseudo", password: "Doeufr", rank: 29};
    var user2 = {pseudo: "pseudo", password: "Dor", rank: 29};

    //insertUser(User, user);
    deleteUser(User, user);
    //updateUser(User, user, user2)
}


function insertUser(User, user) {
    User.createAsync(user)
        .then(function () {
            console.log("user : " + user.pseudo + " created");
        }).catch(function (err) {
        console.error('Creation error for user : ' + user.pseudo + '' + err);
    });
}

function updateUser(User, userBefore, userAfter) {
    User.findAsync({pseudo: userBefore.pseudo})
        .then(function (results) {
            console.log("user : " + results[0].pseudo);
            results[0].password = userAfter.password;
            results[0].rank = userAfter.rank;
            results[0].pseudo = userAfter.pseudo;
            results[0].saveAsync();
        }).then(function (results) {
            console.log("saved !");
        }
    ).catch(function (err) {
        console.error('Update error for user : ' + userBefore.pseudo + '' + err);
    });
}


function deleteUser(User, user) {
    User.findAsync({pseudo: user.pseudo})
        .then(function (results) {
            console.log("user : " + results[0].pseudo);
            results[0].removeAsync();
        }).then(function (results) {
        console.log("Deleted !");
    }).catch(function (err) {
        console.error('Deletion error for user : ' + '' + err);
    });
}

*/
