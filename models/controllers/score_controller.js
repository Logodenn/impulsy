var models = require('../models/');

module.exports = {
    create: function (score) {
        models(function (err, db) {
            if (err) throw err;

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
                    db.close();
                    console.log("Done!");
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
}