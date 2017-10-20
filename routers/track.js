var orm = require('orm');
const express = require('express');
const router = express.Router();
var helpers = require('./_helpers');
const logger = require('winston');


router.get("/", (req, res, next) => {
    req.models.track.find().limit(4).all(function (err, tracks) {
        if (err) {
            logger.debug(err);
            return next(err);
        }

        var items = tracks.map(function (m) {
            return m.serialize();
        });

        res.send({items: items});
    });
});

router.get("/:trackId", (req, res, next) => {
    req.models.track.get(req.params.trackId, function (err, track) {
        if (err) {
            logger.debug(err);
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                return res.status(404).send("Track not found");
            } else {
                return next(err);
            }
        }
        //track.getScores();
        req.models.score.find({track_id: track.id}, function (err, scores) {
            if (err) {
                logger.debug(err);
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    return res.status(404).send("Score not found");
                } else {
                    return next(err);
                }
            }
            track.scores = scores;
            var item = track.serialize();
            res.send({item: item});
        });
    });
});

router.post("/", (req, res, next) => {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;
    params.information = JSON.stringify(params.information);

    req.models.track.create(params, function (err, track) {
        if (err) {
            if (Array.isArray(err)) {
                return res.send(200, {errors: helpers.formatErrors(err)});
            } else {
                return next(err);
            }
        }

        logger.info("track" + track.id + " created !");

        return res.status(200).send(track.serialize())
    });
});

router.delete("/", (req, res, next) => {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.track.get(params.track_id, function (err, track) {
        if (err) {
            logger.debug(err);
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                return res.status(404).send("Track not found");
            } else {
                return next(err);
            }
        }
        track.remove(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }

            logger.info("track " + track.id + " removed !");
        });

        req.models.score.find({track_id: track.id}).remove(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }

            logger.info("scores for track " + track.id + " removed !");
        });

        return res.status(202).send('removed');
    });
});


router.post("/update", (req, res, next) => {

    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    req.models.track.get(params.track_id, function (err, track) {
        if (err) {
            logger.debug(err);
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                return res.status(404).send("Track not found");
            } else {
                return next(err);
            }
        }
        if (params.name) track.name = params.name;

        if (params.link) track.link = params.link;

        if (params.information) track.information = JSON.stringify(params.information);

        logger.info("track" + track.id + " updated !");

        track.save(function (err) {
            if (err) {
                logger.debug(err);
                return next(err);
            }
            return res.status(202).send(track.serialize());
        });
    });
});


module.exports = router;