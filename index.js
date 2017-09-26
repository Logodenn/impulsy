var express = require('express');
var app = express();

const youtubeRouter = require('./router/youtube');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send("Hello World!");
});

app.use('/youtube', youtubeRouter);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var game = { "pos_player" : 1,  // ici 0, 1, 2, 3 --- 0 upper and 3 lowest 
              "array_spectrum" : new Array(), // array of 0 and 1 --- 0 : small and 1 big
              "array_artefacts": new Array() // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
}; 



function get_random(limit) 
{
  //Example, including customisable intervals [lower_bound, upper_bound)
  var lower_bound = 0;
  var upper_bound = 3;
  var unique_random_numbers = [];

  while (unique_random_numbers.length < limit) 
  {
  var random_number = Math.round(Math.random()*(upper_bound - lower_bound) + lower_bound);
    if (unique_random_numbers.indexOf(random_number) == -1) 
    { 
        // Yay! new random number
        unique_random_numbers.push( random_number );
    }
  }
  // unique_random_numbers is an array containing 3 unique numbers in the given range
}