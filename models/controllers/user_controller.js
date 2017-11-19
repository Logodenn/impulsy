var orm = require('orm');
var models = require('../models');
const logger = require('winston');


module.exports = {
    list: function (cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find().all(function (err, users) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, users);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    getUserId: function (id, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            }
            db.models.user.get(id, function (err, user) {
                if (err) {
                    logger.error(err);
                    cb(err);
                } else {
                    cb(null, user);
                }
                logger.info("Done!");
            });
        });
    },
    getUser: function (param, isMail, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                if (isMail) {
                    couple = {
                        mail: param
                    };
                } else {
                    couple = {
                        pseudo: param
                    };
                }
                db.models.user.find(couple, function (err, user) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        cb(null, user[0]);
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    create: function (user, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.create(user, function (err, message) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        logger.info("User created!");
                        cb(null, message);
                    }
                });
            }
        });
    },


    delete: function (pseudo, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo
                }, function (err, user) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        user[0].remove(function (err) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                logger.info("user " + user[0].id + " removed !");

                                //TODO attention si user undefined
                                db.models.score.find({
                                    user_id: user[0].id
                                }).remove(function (err) {
                                    if (err) {
                                        logger.error(err);
                                        cb(err);
                                    } else {
                                        logger.info("scores for user " + user[0].id + " removed !");
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

    update: function (user, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.get(user.user_id, function (err, userUpdate) {
                    if (err) {
                        logger.error(err);
                        if (err.code == orm.ErrorCodes.NOT_FOUND) {
                            cb("User not found");
                        } else {
                            cb(err);
                        }
                    } else {
                        if (user.pseudo && user.pseudo != userUpdate.pseudo) userUpdate.pseudo = user.pseudo;

                        if (user.password) userUpdate.password = user.password;

                        if (user.mail) userUpdate.mail = user.mail;

                        if (user.rank) userUpdate.rank = user.rank;

                        userUpdate.save(function (err) {
                            if (err) {
                                logger.debug(err);
                                cb(err);
                            } else {
                                logger.info("user" + user.id + " updated !");
                                cb(null, userUpdate)
                            }
                        });
                    }
                });
            }
        });
    },

    listFriends: function (pseudo, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo
                }, function (err, user) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        user[0].getFriends(function (err, results) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                cb(null, results);
                            }
                        });
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    createFriend: function (pseudo1, pseudo2, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo1
                }, function (err, user1) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        db.models.user.find({
                            pseudo: pseudo2
                        }, function (err, user2) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                user1[0].getFriends(function (err, results) {
                                    if (err) {
                                        logger.error(err);
                                        cb(err);
                                    } else {
                                        user1[0].hasFriends([user2[0]], function (err, result) {
                                            if (err) {
                                                logger.error(err);
                                                cb(err);
                                            } else {
                                                if (result) {
                                                    logger.error("Yet friends")
                                                } else {
                                                    user1[0].addFriends([user2[0]]);
                                                    user2[0].addFriends([user1[0]]);
                                                    logger.info("Friends created!");
                                                    cb(null, "Friends created!");
                                                }
                                            }
                                        });
                                    }

                                })

                            }
                        });
                    }
                });
            }
        });
    },

    removeFriend: function (pseudo1, pseudo2, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo1
                }, function (err, user1) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        db.models.user.find({
                            pseudo: pseudo2
                        }, function (err, user2) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                user1[0].removeFriends([user2[0]]);
                                user2[0].removeFriends([user1[0]]);
                                logger.info("Friends removed!");
                                cb(null, "Friends removed!");
                            }
                        });
                    }
                });
            }
        });
    },

    listFavoriteTracks: function (pseudo, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo
                }, function (err, user) {
                    if (err) {
                        logger.error(err);
                        cb(err);
                    } else {
                        user[0].getFavoriteTracks(function (err, results) {
                            if (err) {
                                logger.error(err);
                                cb(err);
                            } else {
                                cb(null, results);
                            }
                        });
                    }
                    logger.info("Done!");
                });
            }
        });
    },

    createFavoriteTrack: function (pseudo, name, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo
                }, function (err, user) {
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
                                user[0].getFavoriteTracks(function (err, results) {
                                    if (err) {
                                        logger.error(err);
                                        cb(err);
                                    } else {
                                        user[0].hasFavoriteTracks([track[0]], function (err, result) {
                                            if (err) {
                                                logger.error(err);
                                                cb(err);
                                            } else {
                                                if (result) {
                                                    logger.error("Yet favoriteTracks")
                                                } else {
                                                    user[0].addFavoriteTracks([track[0]]);
                                                    logger.info("FavoriteTracks created!");
                                                    cb(null, "FavoriteTracks created!");
                                                }
                                            }
                                        });
                                    }

                                })

                            }
                        });
                    }
                });
            }
        });
    },

    removeFavoriteTrack: function (pseudo, name, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.models.user.find({
                    pseudo: pseudo
                }, function (err, user) {
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
                                user[0].removeFavoriteTracks([track[0]]);
                                logger.info("FavoriteTracks removed!");
                                cb(null, "FavoriteTracks removed!");
                            }
                        });
                    }
                });
            }
        });
    },
    bestScores: function (userId, trackId, cb) {
        models(function (err, db) {
            if (err) {
                logger.error(err);
                cb(err);
            } else {
                db.driver.execQuery("select duration from user join score"
                +" on user_id=user.id"
                +" where user_id=? and track_id=? order by duration desc;", [userId,trackId],
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
/*
module.exports = {
    create: function (user) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;
                db.models.user.create(user, function (err, message) {
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

    delete: function (user) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.user.findAsync({pseudo: user.pseudo})
                    .then(function (results) {
                        results[0].removeAsync();
                    }).then(function (results) {
                    console.log(user);
                    console.log("Deleted !");
                }).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    update: function (userBefore, userAfter) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.user.findAsync({pseudo: userBefore.pseudo})
                    .then(function (results) {
                        results[0].password = userAfter.password;
                        results[0].rank = userAfter.rank;
                        results[0].pseudo = userAfter.pseudo;
                        results[0].saveAsync();
                    }).then(function () {
                        console.log(userAfter);
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
}*/