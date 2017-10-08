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

                        //db.close()
                        return res.status(200).send("Done!");
                    });
                });
            });
        });
    }
}