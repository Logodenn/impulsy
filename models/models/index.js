var orm = require('orm');
var settings = require('../config/settings');

var connection = null;

function setup(db, cb) {
    require('./score')(orm, db);
    require('./track')(orm, db);
    require('./user')(orm, db);
    console.log('setup')


        User= db.models.user;
        Track=db.models.track;
        Score=db.models.score;

        Score.hasOne('user', User, { reverse: 'user_pseudo' });
        Score.hasOne('track',Track, {reverse: 'track_name'});



    return cb(null, db);
}

module.exports = function (cb) {
    if (connection) return cb(null, connection);
    console.log('no connection')

    orm.connect(settings.database, function (err, db) {
        if (err) return cb(err);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);

        db.sync(function (err) {
            if (err) throw err;
            console.log('sync')
        });

        setup(db, cb);
    });
};