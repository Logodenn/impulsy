var orm = require('orm');
var settings = require('../config/settings');

var connection = null;

function setup(db, cb) {
    require('./track')(orm, db);
    require('./user')(orm, db);
    require('./score')(orm, db);


    return cb(null, db);
}

module.exports = function (cb) {
    if (connection) return cb(null, connection);
    orm.connect(settings.database, function (err, db) {
        if (err) {
            console.log("et mince !!!!")
            console.log(err);
            return cb(err);
        }


        connection = db;

        //connection.query("CREATE DATABASE impulkljdsfsy", function (err, result) {
            if (err) {

                throw err;
            }
            console.log("Database created");

            db.settings.set('instance.returnAllErrors', true);

            db.sync(function (err) {
                if (err) throw err;
            });

            setup(db, cb);
        });
   // });
};