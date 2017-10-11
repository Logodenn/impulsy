var express = require('express');
var app = express();
var http = require('http').Server(app);
var game = require("./modules/game.js");
const mainRouter = require('./routers/main');
const gameRouter = require('./routers/game');

var io = require('socket.io').listen(http);;
// var io = require('socket.io');

// var io = require("socket.io")(http);
// io.listen(http);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
  console.log('client connected');
  game.initGame(io, socket);
});

//const youtubeRouter = require('./router/youtube');

// var array_spectrum = [0,0,0,1,1,0,1,0]; to test function below 



app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.use('/', mainRouter);
app.use('/game', gameRouter);

app.get('/trackSelection', function(req, res) 
{
  res.render('trackSelection', { message: "Hello World!" });
});

module.exports = http;

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
