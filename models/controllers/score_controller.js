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
                db.models.score.find().all(function (err, scores) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, scores);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    getScore: function (id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                db.models.score.find({id: id}, function (err, score) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, score[0]);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    create: function (score, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            else {
                score.date = new Date();
                //new Date().toISOString();
                db.models.score.create(score, function (err, message) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        logger.info("score created!");
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
            }
            else {
                db.models.score.find({id: id}, function (err, score) {
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
                                logger.info("score " + score.id + " updated !");
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
                    "order by score_total desc;",[],
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
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select AVG(duration) from"
                +" score where track_id = ?;", [track_id],
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
}
;

/*
module.exports = {
    create: function (score, user, track) {
        models(function (err, db) {
            if (err) throw err;
            console.log('create score');


            db.sync(function (err) {
                if (err) throw err;


                db.models.score.create(score, function (err, message) {
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
        return score;
    },

    delete: function (score) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.score.findAsync({date: score.date, user_pseudo: score.user_pseudo})
                    .then(function (results) {
                        results[0].removeAsync();
                    }).then(function (results) {
                    console.log(score);
                    console.log("Deleted !");
                }).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    update: function (scoreBefore, scoreAfter) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.score.findAsync({date: scoreBefore.date, user_pseudo: scoreBefore.user_pseudo})
                    .then(function (results) {
                        results[0].user_pseudo = scoreAfter.user_pseudo;
                        results[0].date = scoreAfter.date;
                        results[0].track_name = scoreAfter.track_name;
                        results[0].duration = scoreAfter.duration;
                        results[0].saveAsync();
                    }).then(function () {
                        console.log(scoreAfter);
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
*/
