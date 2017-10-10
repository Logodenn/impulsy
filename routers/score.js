var orm = require('orm');
const express = require('express');
const router = express.Router();
var moment = require('moment');
var helpers = require('./_helpers');


router.get("/", (req, res, next)=> {

    req.models.score.find().limit(4).all(function (err, scores) {
        if (err) return next(err);

        var items = scores.map(function (m) {
            return m.serialize();
        });

        res.send({ items: items });
    });
});


router.post("/", (req, res, next) => {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;

    console.log(params.user_id);
    req.models.user.get(params.user_id, function (err, user) {
        if (err) {
            if (err.code == orm.ErrorCodes.NOT_FOUND) {
                return res.status(404).send("User not found");
            } else {
                return next(err);
            }
        }

        req.models.track.get(params.track_id, function (err, track) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    return res.status(404).send("Track not found");
                } else {
                    return next(err);
                }
            }

            params.user_date = user.pseudo;
            params.track_date = track.name;
            params.date = new Date().toLocaleString();
            console.log(params.date);
            console.log(params);
            req.models.score.create(params, function (err, score) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.status(200).send({errors: helpers.formatErrors(err)});
                    } else {
                        return next(err);
                    }
                }

                return res.status(200).send(score.serialize());
            });
        });
    });
});

module.exports = router;



