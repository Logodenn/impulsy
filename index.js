var express = require('express');
var app = express();
var orm = require('orm');

var controllers = require('./models/controllers');

controllers.user.create({
    pseudo: "titi", password: "Doeufr", rank: 29
});

controllers.track.create({
    name: "Show must go on !", spectrumLink: "/usr/share/spectre/Show_must_go_on_!"
});

controllers.score.create({
    date: "12/01/3004-10:04:03", user_pseudo: "titi", track_name: "Show must go on !", duration: "45"
});

/*controllers.user.update({
    pseudo: "pseudo65", password: "Doeufr", rank: 29
},{
    pseudo: "pseudo65", password: "Doeufr", rank: 67
});*/

/*controllers.user.delete({
    pseudo: "pseudo65", password: "Doeufr", rank: 29
});*/

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
  res.render('index', { message: "Hello World!" });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/*app.use(orm.express('mysql://root:1234@localhost/mydb', {
        define: function (db, models, next) {
            db.load("./models/index.js", function (err2) {
                if (err2)
                    throw err2;
                db.sync();
            })
            next();
        }
    })
);*/

/*
models(function (err, db) {
    if (err) throw err;

    db.drop(function (err) {
        if (err) throw err;

        db.sync(function (err) {
            if (err) throw err;

            db.models.user.create({
                pseudo: "pseudo2", password: "Doeufr", rank: 29
            }, function (err, message) {
                if (err) throw err;

                db.close()
                console.log("Done!");
            });
        });
    });
});
*/