var express = require('express');
var app = express();

const youtubeRouter = require('./router/youtube');

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

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) 
{
  res.render('index', { message: "Hello World!" });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
/*
var game = { "pos_player" : 1,  // ici 0, 1, 2, 3 --- 0 upper and 3 lowest 
              "array_spectrum" : new Array(), // array of 0 and 1 --- 0 : small and 1 big
              "array_artefacts": new Array() // array of 0, 1, 2, 3 --- 0 upper and 3 lowest 
}; 
*/