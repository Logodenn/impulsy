const express = require('express');
const router = express.Router();
var models = require('../models/models');
const youtube = require("../modules/youtube");
const getArrayArthefacts = require("../utils/artefacts");
const moment = require('moment')
const barsPerSeconds = 2;
router.post("/db", (req, res, next) => {
    models(function (err, db) {
        if (err) return next(err);
        db.drop(function (err) {
            if (err) return next(err);
            db.sync(function (err) {
                if (err) return next(err);
                db.models.user.create({
                    pseudo: "user_test1",
                    password: "azerty",
                    rank: "29"
                }, function (err, user) {
                    if (err) return next(err);
                    db.models.user.create({
                        pseudo: "user_test2",
                        password: "qsdfg",
                        rank: "2"
                    }, function (err, user) {
                        if (err) return next(err);
                        youtube.getAudioStream("cKfOycpc0t0", false, "lowest", function (err, stream) {
                            if (err) console.log(err);
                            else {
                                youtube.getBars(stream, barsPerSeconds, function (err, bars) {
                                    if (err) console.log(err);
                                    else {
                                        var arraySpectrum = bars;
                                        var arrayArtefacts = getArrayArthefacts(arraySpectrum); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
                                        track_information = {
                                            arraySpectrum: arraySpectrum,
                                            arrayArtefacts: arrayArtefacts
                                        };
                                        var track = {
                                            name: "30 Second Sounds #1",
                                            link: "cKfOycpc0t0",
                                            information: track_information
                                        };
                                        // add track to database 
                                        db.models.track.create(track, function (err, result) {
                                            if (err) console.log(err);
                                            youtube.getAudioStream("HsrBhiLwz_I", false, "lowest", function (err, stream2) {
                                                if (err) console.log(err);
                                                else {
                                                    youtube.getBars(stream2, barsPerSeconds, function (err, bars2) {
                                                        if (err) console.log(err);
                                                        else {
                                                            var arraySpectrum2 = bars2;
                                                            var arrayArtefacts2 = getArrayArthefacts(arraySpectrum2); // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
                                                            track_information2 = {
                                                                arraySpectrum: arraySpectrum2,
                                                                arrayArtefacts: arrayArtefacts2
                                                            };
                                                            console.log(track_information2);
                                                            var track2 = {
                                                                name: "Harlem Shake - Sound Effects 30 seconds",
                                                                link: "HsrBhiLwz_I",
                                                                information: track_information2
                                                            };
                                                            // add track to database 
                                                            db.models.track.create(track2, function (err, result) {
                                                                if (err) console.log(err);
                                                                db.models.score.create({
                                                                    date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                    duration: 24,
                                                                    user_id: 1,
                                                                    track_id: 1
                                                                }, function (err, user) {
                                                                    if (err) return next(err);
                                                                    db.models.score.create({
                                                                        date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                        duration: 24,
                                                                        user_id: 1,
                                                                        track_id: 2
                                                                    }, function (err, user) {
                                                                        if (err) return next(err);
                                                                        return res.status(200).send("Done!");
                                                                    });
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});


module.exports = router;