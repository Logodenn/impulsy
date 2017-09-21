var express = require('express');
var app = express();
var ffmpeg = require('fluent-ffmpeg');
var ytdl = require('ytdl-core');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.send("Hello World!");
});

app.get('/music', (req, res) => {
  var stream = ytdl('https://www.youtube.com/watch?v=etgDzrB7gcw');

  stream.on('info', (infos) => {
    proc = new ffmpeg({ source: stream });
    proc.noVideo(stream)
        .format('mp3')
        .on('error', function(err) {
            console.log('youtube-download.js #download -> ffmpeg "error" event: ' + err.message);
        });
      
    res.attachment('download.mp3');
    proc.writeToStream(res, {end: true});
  })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
