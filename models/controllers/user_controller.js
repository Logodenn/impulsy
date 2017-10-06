var models = require('../models/');

module.exports = {
    create: function (user) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;
                db.models.user.create(user, function (err, message) {
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

    delete: function (user) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.user.findAsync({pseudo: user.pseudo})
                    .then(function (results) {
                        results[0].removeAsync();
                    }).then(function (results) {
                    console.log(user);
                    console.log("Deleted !");
                }).catch(function (err) {
                    console.error(err);
                    db.close();
                    console.log("Done!");
                });
            });
        });
    },

    update: function (userBefore, userAfter) {
        models(function (err, db) {
            if (err) throw err;

            db.sync(function (err) {
                if (err) throw err;

                db.models.user.findAsync({pseudo: userBefore.pseudo})
                    .then(function (results) {
                        results[0].password = userAfter.password;
                        results[0].rank = userAfter.rank;
                        results[0].pseudo = userAfter.pseudo;
                        results[0].saveAsync();
                    }).then(function () {
                        console.log(userAfter);
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

    /*list: function (req, res, next) {
    req.models.message.find().limit(4).order('-id').all(function (err, messages) {
        if (err) return next(err);

        var items = messages.map(function (m) {
            return m.serialize();
        });

        res.send({ items: items });
    });
},*/
}