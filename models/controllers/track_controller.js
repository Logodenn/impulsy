var orm = require('orm');
var models = require('../models');
const logger = require('winston');


module.exports = {
    list: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                db.models.track.find().all(function (err, tracks) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, tracks);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    getU: function (name, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                db.models.track.find({name: name}, function (err, track) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, track[0]);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    create: function (track, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                track.information=JSON.stringify(track.information);
                db.models.track.create(track, function (err, message) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        logger.info("track created!");
                        cb(null, message);
                    }
                });
            }
        });
    },


    delete: function (name, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                db.models.track.find({name: name}, function (err, track) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        track[0].remove(function (err) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                logger.info("track " + track[0].id + " removed !");
                                db.models.score.find({id: track[0].id}).remove(function (err) {
                                    if (err) {
                                        logger.error(err);
                                        cb(err);
                                    } else {
                                        logger.info("scores for track " + track[0].id + " removed !");
                                        cb(null, "ok")
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    update: function (track, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.track.get(track.id, function (err, trackUpdate) {
                    if (err) {
                        logger.error(err);
                        if (err.code == orm.ErrorCodes.NOT_FOUND) {
                            cb("track not found");
                        } else {
                            cb(err);
                        }
                    } else {
                        if (track.name) trackUpdate.name = track.name;

                        if (track.link) trackUpdate.link = track.link;

                        if (track.information) trackUpdate.information = JSON.stringify(track.information);

                        logger.debug(track);
                        trackUpdate.save(function (err) {
                            if (err) {
                                logger.debug(err);
                                cb(err);
                            } else {
                                logger.info("track" + track.id + " updated !");
                                cb(null, trackUpdate)
                            }
                        });
                    }
                });
            }
        });
    }
};


/*
module.exports = {
    create: function (track) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.create(track, function (err, message) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log(message);
                    }
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    delete: function (track) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.findAsync({name: track.name})
                    .then(function (results) {
                        results[0].removeAsync();
                    }).then(function (results) {
                    console.log(track);
                    console.log("Deleted !");
                }).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    update: function (trackBefore, trackAfter) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.findAsync({name: trackBefore.name})
                    .then(function (results) {
                        results[0].link = trackAfter.link;
                        results[0].name = trackAfter.name;
                        results[0].saveAsync();
                    }).then(function () {
                        console.log(trackAfter);
                        console.log("updated");

                        db.close();
                        console.log("Done!");
                    }
                ).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    }

    /!*list: function (req, res, next) {
    req.models.message.find().limit(4).order('-id').all(function (err, messages) {
        if (err) return next(err);

        var items = messages.map(function (m) {
            return m.serialize();
        });

        res.send({ items: items });
    });
},*!/
*/
