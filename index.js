var express = require('express');
var app = express();
var http = require('http').Server(app);
var game = require("./modules/game.js");
const mainRouter = require('./routers/main');
const gameRouter = require('./routers/game');
const dbRouter = require('./routers/db');
const userRouter = require('./routers/user');
const trackRouter = require('./routers/track');
const scoreRouter = require('./routers/score');
const logger = require('winston');

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
    console.log(results);
});*/

/*u={pseudo : "hello", mail: "coco@gmail.com",rank : 34, password : "KJKJKJKhhh"};
controller.user.create(u,function (err,results) {
    console.log(results);
});*/

/*var user= controller.user.delete("hello",function (err,results) {
    console.log(results);
});*/


/*up={user_id: 1, pseudo : "heljilo", mail: "coco@gmail.comd",rank : 34, password : "KJKJKJKhhh"};

var user= controller.user.update(up,function (err,results) {
    console.log(results);
});*/

/////////////////SCORE///////////////////////

/*var score= controller.score.list(function (err,results) {
    console.log(results);
});*/

/*var user= controller.score.getU(2,function (err,results) {
    console.log(results);
});*/

/*u={duration : "3423", user_id :1 , track_id : 2};
controller.score.create(u,function (err,results) {
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

/*var user= controller.track.getU("h",function (err,results) {
    console.log(results);
});*/

/*u={name :"Julienne", link:"ftozertiuioj68bh", information:"{aaa:aazzz, fez:ty}"};
controller.track.create(u,function (err,results) {
    console.log(results);
});*/

/*
var user= controller.track.delete("Julien",function (err,results) {
    console.log(results);
});
*/
/*u={id : 2, name:"htrertrezz", link : "kijuye", information : "{aaa:aassdfsefesfffffffffffffffffffffffdqs, hez:ty}" };
var user= controller.track.update(u,function (err,results) {
    console.log(results);
});*/



///////////////////////////////////////////////////////////////////////////////

var io = require('socket.io').listen(http);
// var io = require('socket.io');

// var io = require("socket.io")(http);
// io.listen(http);


// Listen for Socket.IO Connections. Once connected, start the game logic.
/*io.sockets.on('connection', function (socket) {
  console.log('client connected');
  game.initGame(io, socket);
});*/

//const youtubeRouter = require('./router/youtube');

// var array_spectrum = [0,0,0,1,1,0,1,0]; to test function below

app.use(bodyParser.urlencoded({
    extended: true
}));

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
  res.render('trackSelection', { message: "Hello World!" });
});

http.listen(app.get('port'), function() {
  console.log('Impulsy is running on port', app.get('port'));
  console.log('Go to: http://localhost:5000/ to see the app.');
});