const express = require('express');
const router = express.Router();
var models = require('../models/models');

router.post("/db", (req, res, next) => {

    models(function (err, db) {
        if (err) return next(err);

        db.drop(function (err) {
            if (err) return next(err);

            db.sync(function (err) {
                if (err) return next(err);
                db.models.user.create({
                    pseudo: "jiji", password: "qfds", rank: "29"
                }, function (err, user) {
                    if (err) return next(err);

                    db.models.user.create({
                        pseudo: "momo", password: "qfs", rank: "2"
                    }, function (err, user) {
                        if (err) return next(err);

                        db.models.track.create({
                            name: "lolo", link: "ftozertiuioj68bh", information: "{'aaa':'aazzz', 'fez':'ty'}"
                        }, function (err, user) {
                            if (err) return next(err);
                            db.models.score.create({
                                date: new Date().toLocaleString(), duration: 678333, user_id: 1, track_id:1
                            }, function (err, user) {
                                if (err) return next(err);
                                return res.status(200).send("Done!");
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
