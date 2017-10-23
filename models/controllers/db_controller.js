/*
var models = require('../models/');

module.exports = {
    clean: function (req, res, next) {

        models(function (err, db) {
            if (err) return next(err);

            db.drop(function (err) {
                if (err) return next(err);

                db.sync(function (err) {
                    if (err) return next(err);

                    db.models.user.create({
                        pseudo: "jiji", password: "qfds", rank:"29"
                    }, function (err, user) {
                        if (err) return next(err);

                        db.models.user.create({
                            pseudo: "momo", password: "qfds", rank:"29"
                        }, function (err, user) {
                            if (err) return next(err);
                            db.models.track.create({
                                name :"lolo", link:"ftozertiuioj68bh", information:"{'aaa':'aazzz', 'fez':'ty'}"
                            }, function (err, user) {
                                if (err) return next(err);
                                db.models.track.create({
                                    id:3, date : new Date().toLocaleString(), duration : 678333
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
    }
}*/
