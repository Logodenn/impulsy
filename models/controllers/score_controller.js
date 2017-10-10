var orm = require('orm');
var helpers = require('../../routers/_helpers');
var moment = require('moment');

module.exports = {
    create: function (req, res, next) {
        var params = req.params;

        req.models.user.get(req.params.user_id, function (err, user) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    return res.status(404).send("User ngot found");
                } else {
                    return next(err);
                }
            }

            req.models.track.get(req.params.track_id, function (err, track) {
                if (err) {
                    if (err.code == orm.ErrorCodes.NOT_FOUND) {
                        return res.status(404).send("Track not found");
                    } else {
                        return next(err);
                    }
                }

                params.user_date = user.pseudo;
                params.track_date = track.name;
                params.date=moment(this.createdAt).fromNow();

                console.log(params);
                req.models.score.create(params, function (err, score) {
                    if(err) {
                        if(Array.isArray(err)) {
                            return res.status(200).send({ errors: helpers.formatErrors(err) });
                        } else {
                            return next(err);
                        }
                    }

                    return res.status(200).send(score.serialize());
                });
            });
        });
    }
};

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
