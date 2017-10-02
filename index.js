var express = require('express');
var app = express();
var http = require('http').Server(app);
var game = require("./modules/game.js");

<<<<<<< HEAD
=======
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

function get_random(array_spectrum) 
{
  //Example, including customisable intervals [lower_bound, upper_bound)
  var random_numbers = [];
  array_spectrum.forEach(function(element) {
    if (element == 0)
    {
      var lower_bound = 1;
      var upper_bound = 2;
    }
    else 
    {
      var lower_bound = 0;
      var upper_bound = 3;
    }
    var random_number = Math.round(Math.random()*(upper_bound - lower_bound) + lower_bound);
    // Yay! new random number
    random_numbers.push( random_number );
  });
  return random_numbers;
};

>>>>>>> positionListener
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) 
{
  res.render('index', { message: "Hello World!" });
});

app.get('/trackSelection', function(req, res) 
{
  res.render('trackSelection', { message: "Hello World!" });
});

app.get('/game', function(req, res) 
{
  res.render('game', { message: "Hello World!" });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


