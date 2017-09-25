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
