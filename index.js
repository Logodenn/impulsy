var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var app = express();
var http = require('http').Server(app);
var game = require("./modules/game.js");
const mainRouter = require('./routers/main');
const gameRouter = require('./routers/game');
const authRouter = require('./routers/auth');
const db = require('../models/controllers')



// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function (username, password, cb) {
        // TODO : vérifier la méthode pour trouver un utiliseteur par son pseudo ou/et mail ? 
        db.user.getU(username, function (err, result) {
            if (err) {
                return cb(err);
            }
            if (!result) {
                return cb(null, false);
            }
            if (result.password != password) {// TODO salt password with username/email   ? 
                return cb(null, false);
            }
            return cb(null, result);
        });
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    db.users.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});
// Use application-level middleware for common functionality, including
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

var io = require('socket.io').listen(http);;
// var io = require('socket.io');

// var io = require("socket.io")(http);
// io.listen(http);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    console.log('client connected');
    game.initGame(io, socket);
});

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.use('/', mainRouter);
app.use('/game', gameRouter);

app.get('/trackSelection', function (req, res) {
    res.render('trackSelection', {
        message: "Hello World!"
    });
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