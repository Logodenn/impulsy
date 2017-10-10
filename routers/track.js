var orm = require('orm');
const express = require('express');
const router = express.Router();
var helpers = require('./_helpers');


router.get("/", (req, res, next)=> {
    req.models.track.find().limit(4).all(function (err, tracks) {
        if (err) return next(err);

        var items = tracks.map(function (m) {
            return m.serialize();
        });

        res.send({ items: items });
    });
});


router.post("/", (req, res, next)=> {
    if (!req.body) return res.sendStatus(400);

    var params = req.body;
    params.information=JSON.stringify(params.information);
    console.log(params.information)
    req.models.track.create(params, function (err, track) {
        if(err) {
            if(Array.isArray(err)) {
                return res.send(200, { errors: helpers.formatErrors(err) });
            } else {
                return next(err);
            }
        }
        return res.status(200).send(track.serialize())
    });
});

module.exports = router;

/*
module.exports = {
    list: function (req, res, next) {
        req.models.track.find().limit(4).all(function (err, tracks) {
            if (err) return next(err);

            var items = tracks.map(function (m) {
                return m.serialize();
            });

            res.send({ items: items });
        });
    },
    create: function (req, res, next) {
        var params = req.params;
        //var params = _.pick(req.body, 'title', 'body');

        req.models.track.create(params, function (err, track) {
            if(err) {
                if(Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            return res.status(200).send(track.serialize());
        });
    },
    get: function (req, res, next) {

    }
};*/



/*
module.exports = {
    create: function (track) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.create(track, function (err, message) {
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

    delete: function (track) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.findAsync({name: track.name})
                    .then(function (results) {
                        results[0].removeAsync();
                    }).then(function (results) {
                    console.log(track);
                    console.log("Deleted !");
                }).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    update: function (trackBefore, trackAfter) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.track.findAsync({name: trackBefore.name})
                    .then(function (results) {
                        results[0].link = trackAfter.link;
                        results[0].name = trackAfter.name;
                        results[0].saveAsync();
                    }).then(function () {
                        console.log(trackAfter);
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
*/
