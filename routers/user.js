var orm = require('orm');
const express = require('express');
const router = express.Router();
var helpers = require('./_helpers');
const logger = require('winston');

logger.level = 'debug';

router.get("/", (req, res, next) => {
    req.models.user.find().limit(4).all(function (err, users) {
        if (err) {
            logger.debug(err);
            return next(err);
        }

        var items = users.map(function (u) {
            return u.serialize();
        });
        res.send({items: items});
    });
});

router.get("/:userId", (req, res, next) => {
    req.models.user.get(req.params.userId, function (err, user) {
        //user.getScores();
         //   if (err) return next(err);});
        //user.getUsers();
        if (user) {
            req.models.score.find({user_id: user.id}, function (err, scores) {
                if (err) {
                    logger.debug(err);
                }
                user.scores = scores;
                var item = user.serialize();
                res.send({item: item});
            });
        } else {
            logger.debug("user "+req.params.userId+" undefined");
            return res.status(400).send("undefined");
        }
    });
});


router.post("/", (req, res, next) => {

    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.user.create(params, function (err, user) {
        if (err) {
            if (Array.isArray(err)) {
                logger.debug(err);
                return res.send(200, {errors: helpers.formatErrors(err)});
            } else {
                logger.debug(err);
                return next(err);
            }
        }
        logger.info("user " + user.id + " created !");
        return res.status(200).send(user.serialize())
    });
});

router.delete("/", (req, res, next) => {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.user.get(params.user_id, function (err, user) {
        if (err) {
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                logger.debug(err);
                return res.status(404).send("User not found");
            } else {
                logger.debug(err);
                return next(err);
            }
        }
        user.remove(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }

            logger.info("user " + user.id + " removed !");
        });

        req.models.score.find({user_id: user.id}).remove(function (err) {
            if (err) return next(err);

            logger.info("scores for user " + user.id + " removed !");
        });

        return res.status(202).send('removed');
    });
});

router.post("/update", (req, res, next) => {

    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.user.get(params.user_id, function (err, user) {
        if (err) {
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                logger.debug(err);
                return res.status(404).send("User not found");
            } else {
                logger.debug(err);
                return next(err);
            }
        }
        if (params.pseudo) user.pseudo = params.pseudo;

        if (params.password) user.password = params.password;

        if (params.mail) user.mail = params.mail;

        if (params.rank) user.rank = params.rank;

        logger.info("user"+user.id+" updated !");

        user.save(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }
            return res.status(202).send(user.serialize());
        });
    });
});

module.exports = router;

/*
module.exports = {
    list: function (req, res, next) {
        req.models.user.find().limit(4).all(function (err, users) {
            if (err) return next(err);

            var items = users.map(function (m) {
                return m.serialize();
            });

            res.send({ items: items });
        });
    },
    create: function (req, res, next) {

        var params = req.params;
        //var params = _.pick(req.body, 'pseudo', 'password', 'rank');
        console.log(req.params);
        req.models.user.create(params, function (err, user) {
            if(err) {
                if(Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            return res.status(200).send(user.serialize())
        });
    },
    get: function (req, res, next) {

    }
};
*/

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
