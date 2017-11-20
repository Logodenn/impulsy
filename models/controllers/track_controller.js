var orm = require('orm');
var models = require('../models');
const logger = require('../../utils/logger')(module)

module.exports = {
    get: function (id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.track.get(id, function (err, track) {
                    if (err) {
                        logger.error(err);
                        if (err.code == orm.ErrorCodes.NOT_FOUND) {
                            cb("track not found");
                        } else {
                            cb(err);
                        }
                    } else {
                        cb(null, track);
                    }
                });
            }
        });
    },

    list: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.track.find().all(function (err, tracks) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, tracks);
                    }
                });
            }
        });
    },

    getTrackName: function (name, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.track.find({
                    name: name
                }, function (err, track) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        if (track.length != 0) {
                            cb(null, track[0]);
                        } else {
                            cb(null, undefined);
                        }
                    }
                });
            }
        });
    },

    getTrackLink: function (link, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.track.find({
                    link: link
                }, function (err, track) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        if (track.length != 0) {
                            cb(null, track[0]);
                        } else {
                            cb(null, undefined);
                        }
                    }
                });
            }
        });
    },


    // Attention : bien respecter le format suivant pour le champs information : '{"arrayArtefact":"123423", "arraySpectrum":"24132"}'
    create: function (track, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                track.information = JSON.stringify(track.information);
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
            } else {
                db.models.track.find({
                    name: name
                }, function (err, track) {
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
                                db.models.score.find({
                                    id: track[0].id
                                }).remove(function (err) {
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

                        trackUpdate.save(function (err) {
                            if (err) {
                                logger.debug(err);
                                cb(err);
                            } else {
                                //logger.info("track" + track.id + " updated !");
                                cb(null, trackUpdate)
                            }
                        });
                    }
                });
            }
        });
    },

    getTrendTracks: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("SELECT score.track_id, track.name, COUNT(*) AS nb" +
                    " FROM score INNER JOIN track ON score.track_id = track.id" +
                    " GROUP BY score.track_id" +
                    " ORDER BY nb desc",
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            //console.log("rt");
                            cb(null, data);
                        }
                    })
            }
        });
    },


    getUserMostPlayedTracks: function (user_id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("SELECT track_id, COUNT(*) as nb" +
                    " from score where user_id=? " +
                    "group by track_id " +
                    "order by nb desc", [user_id],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    })
            }
        });
    },

    usedTracks: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select track.id, name, link, information"
                +" from score join track"
                 +" on track_id=track.id;", [],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    })
            }
        });
    }
};