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

var bodyParser = require('body-parser');


var environment = require('./models/config/environment');
var settings = require('./models/config/settings');
//var modelRouter = require('./models/config/route');
//var models = require('./models/models');


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