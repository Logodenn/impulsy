const express = require('express');
const router = express.Router();
var models = require('../models/models');

router.post("/db", (req, res, next)=> {

    models(function (err, db) {
        if (err) return next(err);

        db.drop(function (err) {
            if (err) return next(err);

            db.sync(function (err) {
                if (err) return next(err);

                db.models.user.create({
                    pseudo: "jiji", password: "qfds", mail : "popopo@gmail.com", rank:"29"
                }, function (err, user) {
                    if (err) return next(err);

                    return res.status(200).send("Done!");
                });
            });
        });
    });
});

module.exports = router;
