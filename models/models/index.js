var orm = require('orm');
var settings = require('../config/settings');

const logger = require('winston');

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
            logger.error(err);
            return cb(err);
        }
        connection = db;
        db.driver.execQuery("CREATE DATABASE IF NOT EXISTS "+process.env.DB_NAME, function (err, result) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                logger.info("Database created");

                db.settings.set('instance.returnAllErrors', true);
                
                /*db.sync(function (err) {
                    logger.error(err);
                });*/
                setup(db, cb);
            }
        });
    });
};