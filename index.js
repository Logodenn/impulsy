require('dotenv').config();
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var app = express();
const http = require('http').Server(app);
const game = require("./modules/game.js");
const logger = require('./utils/logger')(module);
const mainRouter = require('./routers/main');
const gameRouter = require('./routers/game');
const dbRouter = require('./routers/db');
const userRouter = require('./routers/user');
const trackRouter = require('./routers/track');
const scoreRouter = require('./routers/score');

var controller=require('./models/controllers');



var bodyParser = require('body-parser');


var environment = require('./models/config/environment');
var settings = require('./models/config/settings');
//var modelRouter = require('./models/config/route');
//var models = require('./models/models');


///////////////////////TESTS//////////////////////////////////////////////


/////////USER/////////////

/*var users= controller.user.list(function (err,results) {
    console.log(results);
});*/

/*var user= controller.user.getU("jiji",function (err,results) {
    results.getScores(function (err,results) {
        console.log(results);
    });
});*/

/*
u={pseudo : "hello", mail: "coco@gmail.com",rank : 34, password : "KJKJKJKhhh"};
controller.user.create(u,function (err,results) {
    console.log(results);
});
*/

/*var user= controller.user.delete("momo",function (err,results) {
    console.log(results);
});*/


/*up={user_id: 1, pseudo : "heljilo", mail: "coco@gmail.comd",rank : 34, password : "KJKJKJKhhh"};

var user= controller.user.update(up,function (err,results) {
    console.log(results);
});*/

/*var user= controller.user.listFriends("jiji",function (err,results) {
        console.log(results);
});*/


var user= controller.user.createFriend("jiji","momo",function (err,results) {
     console.log(results);
 });


/*var user= controller.user.removeFriend("jiji","momo",function (err,results) {
    console.log(results);
});*/



/////////////////SCORE///////////////////////

/*var score= controller.score.list(function (err,results) {
    console.log(results);
});*/

/*u={duration : "3423", user_id :1 , track_id : 2};
controller.score.create(u,function (err,results) {
    console.log(results);
});*/

/*var user= controller.scores.getS(1,function (err,results) {
    console.log(results);
});*/



/*var user= controller.score.delete(4,function (err,results) {
    console.log(results);
});*/

/*u={id:3, date : new Date().toLocaleString(), duration : 678333 };
var user= controller.score.update(u,function (err,results) {
    console.log(results);
});*/

/////////////////TRACK///////////////////////


/*var score= controller.track.list(function (err,results) {
    console.log(results);
});*/

/*
var user = controller.track.getT("Julien", function (err, results) {
    console.log(results.information.arrayArtefact);
});
*/

/*var u={name :"Julien", link:"ftozertiuioj68bh", information:"{'aaa':'aazzz', 'fez':'ty'}"};
controller.track.create(u,function (err,results) {
    console.log(results);
});*/

/*
var user= controller.track.delete("Julien",function (err,results) {
    console.log(results);
});
*/



/*u={id : 2, name:"Julien", link : "kijuye", information : '{"arrayArtefact":"123423", "arraySpectrum":"24132"}'};
var user= controller.track.update(u,function (err,results) {
    console.log(results);
});*/

/////////////////FRIENDS///////////////////////

/*

var score= controller.user.getU("jiji",function (err,jiji) {

    controller.user.getU("hello",function (err,hello) {
        jiji.addFriends([hello],function(err, friends) {
            jiji.getFriends(function(err, friends) {
                console.log(friends[0].id)
            });
        });
    });
});
*/

/*
var user = controller.track.getT("Julien", function (err, results) {
    console.log(results.information.arrayArtefact);
});
*/

/*var u={name :"Julien", link:"ftozertiuioj68bh", information:"{'aaa':'aazzz', 'fez':'ty'}"};
controller.track.create(u,function (err,results) {
    console.log(results);
});*/

/*
var user= controller.track.delete("Julien",function (err,results) {
    console.log(results);
});
*/



/*u={id : 2, name:"Julien", link : "kijuye", information : '{"arrayArtefact":"123423", "arraySpectrum":"24132"}'};
var user= controller.track.update(u,function (err,results) {
    console.log(results);
});*/

const authRouter = require('./routers/auth');
const db = require('./models/controllers')

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function (username, password, cb) {
        // TODO : vérifier la méthode pour trouver un utiliseteur par son pseudo ou/et mail ? 
        db.user.getUser(username, function (err, result) {
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

const io = require('socket.io').listen(http);


// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
  logger.info('Connection of a client');
  game.initGame(io, socket);
});

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');


environment(app);
//modelRouter(app);

app.use(express.static(__dirname + '/assets'));

app.use('/', mainRouter);
app.use('/game', gameRouter);

app.use('/db', dbRouter);
app.use('/user', userRouter);
app.use('/track', trackRouter);
app.use('/score', scoreRouter);

app.get('/trackSelection', function(req, res) 
{
  res.render('hallOfFame', { message: "Hello World!" });
});

app.get('/login', function(req, res) 
{
  res.render('login', { message: "Hello World!" });
});

module.exports = http;
