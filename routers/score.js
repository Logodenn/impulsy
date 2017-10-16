var orm = require('orm');
const express = require('express');
const router = express.Router();
var moment = require('moment');
var helpers = require('./_helpers');
const logger = require('winston');



router.get("/", (req, res, next)=> {

    req.models.score.find().limit(4).all(function (err, scores) {
        if (err) {
            logger.debug(err);
            return next(err);
        }

        var items = scores.map(function (m) {
            return m.serialize();
        });

        res.send({ items: items });
    });
});


router.post("/", (req, res, next) => {
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

        req.models.track.get(params.track_id, function (err, track) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    logger.debug(err);
                    return res.status(404).send("Track not found");
                } else {
                    logger.debug(err);
                    return next(err);
                }
            }

            // params.user_date = user.pseudo;
            // params.track_date = track.name;
            params.date = new Date().toLocaleString();

            req.models.score.create(params, function (err, score) {
                if (err) {
                    if (Array.isArray(err)) {
                        logger.debug(err);
                        return res.status(200).send({errors: helpers.formatErrors(err)});
                    } else {
                        logger.debug(err)
                        return next(err);
                    }
                }

                logger.info("score "+score.id+" created !");

                return res.status(200).send(score.serialize());
            });
        });
    });
});

router.delete("/", (req, res, next) => {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.score.get(params.score_id, function (err, score) {
        if (err) {
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                logger.debug(err);
                return res.status(404).send("Score not found");
            } else {
                logger.debug(err);
                return next(err);
            }
        }
        score.remove(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }

            logger.info("score " + score.id + " removed !");
        });

        return res.status(202).send('removed');
    });
});

router.post("/update", (req, res, next) => {

    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.score.get(params.score_id, function (err, score) {
        if (err) {
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                logger.debug(err);
                return res.status(404).send("Score not found");
            } else {
                logger.debug(err);
                return next(err);
            }
        }
        if (params.date) score.date = params.date;

        if (params.duration) score.duration = params.duration;


        score.save(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }
            return res.status(200).send(score.serialize());
        });
    });
});

module.exports = router;



