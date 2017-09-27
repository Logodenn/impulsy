var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res) {
  res.render('index', { message: "Hello World!" });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
