var orm = require('orm');
var models = require('../models');
const logger = require('../../utils/logger')(module)


module.exports = {
    list: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.score.find().all(function (err, scores) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, scores);
                    }
                });
            }
        });
    },

    getScore: function (id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.score.find({
                    id: id
                }, function (err, score) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, score[0]);
                    }
                });
            }
        });
    },

    create: function (score, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                score.date = new Date();
                //new Date().toISOString();
                db.models.score.create(score, function (err, message) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        logger.info("score created");
                        cb(null, message);
                    }
                });
            }
        });
    },


    delete: function (id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.score.find({
                    id: id
                }, function (err, score) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        score[0].remove(function (err) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                cb(null, "removed");
                                logger.info("score " + score[0].id + " removed !");
                            }
                        });
                    }
                });
            }
        });
    },

    update: function (score, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.score.get(score.id, function (err, scoreUpdate) {
                    if (err) {
                        logger.error(err);
                        if (err.code == orm.ErrorCodes.NOT_FOUND) {
                            cb("score not found");
                        } else {
                            cb(err);
                        }
                    } else {

                        if (score.date) scoreUpdate.date = score.date;

                        if (score.duration) scoreUpdate.duration = score.duration;

                        if (score.difficulty) scoreUpdate.difficulty = score.difficulty;

                        scoreUpdate.save(function (err) {
                            if (err) {
                                logger.debug(err);
                                cb(err);
                            } else {
                                //logger.info("score " + score.id + " updated !");
                                cb(null, scoreUpdate)
                            }
                        });
                    }
                });
            }
        });
    },
    bestPlayers: function (track_id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select pseudo, duration" +
                    " from score join user on user_id=user.id" +
                    " where track_id = ? " +
                    "order by duration desc", [track_id],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    },

    bestScoresTrack: function (track_id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select pseudo, duration" +
                    " from score join user on user_id=user.id" +
                    " where track_id = ? " +
                    "order by duration desc", [track_id],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    },

    bestScores: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select pseudo,sum(duration) as score_total" +
                    " from score join user on user_id=user.id" +
                    " group by pseudo " +
                    "order by score_total desc;", [],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    },

    meanScore: function (track_id, cb) {
        models(function (err, db) {
            if (err) {
                loggers.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select AVG(duration) from" +
                    " score where track_id = ?;", [track_id],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    },

    // requete sql degueux mais qui marche !!!!!
    rank: function (min, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select * from "
                +"(select @r := @r+1 as rank, z.* from(select pseudo,sum(duration)"
                +" as score_total from score join user on user_id=user.id"
                +" group by pseudo order by score_total desc) z,"
                +" (select @r:=0) y) as u where rank<? and rank>?;", [min+50,min],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    },
    rankUser: function (pseudo, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select * from "
                +"(select @r := @r+1 as rank, z.* from(select pseudo,sum(duration)"
                +" as score_total from score join user on user_id=user.id"
                +" group by pseudo order by score_total desc) z, "
                +"(select @r:=0) y) as u where pseudo=?;", [pseudo],
                    function (err, data) {
                        if (err) {
                            logger.error(err);
                            cb(err);
                        } else {
                            cb(null, data);
                        }
                    });
            }
        });
    }
};