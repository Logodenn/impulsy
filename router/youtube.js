const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');

router.get('/download/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  // TODO: Check that the video exists. If it doesn't, throw an error
  const stream = ytdl('https://www.youtube.com/watch?v=' + videoId);

  stream.on('error', err => {
    console.log("faf");
  })

  stream.on('info', (infos) => {
    proc = ffmpeg({ source: stream });
    proc.noVideo(stream)
        .format('mp3')
        .on('error', err => {
          console.log('youtube-download.js #download -> ffmpeg "error" event: ' + err.message);
        });
      
    res.attachment('download.mp3');
    proc.writeToStream(res, { end: true });
  });
})

module.exports = router;