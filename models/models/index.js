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