const fs = require('fs');
const util = require('util');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const streamTo = require('stream-to-array');
var AudioContext = require('web-audio-api').AudioContext;
context = new AudioContext;

const stream = ytdl('https://www.youtube.com/watch?v=kJQP7kiw5Fk');
proc = ffmpeg({ source: stream });
proc.noVideo(stream)
    .audioBitrate(0)
    .format('mp3');

let s = proc.pipe();

streamTo(s, (err, parts) => {
  const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part));
  const buff = Buffer.concat(buffers);

  context.decodeAudioData(buff, function(audioBuffer) {
    const pcmdata = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    displayAmplitudes(pcmdata, sampleRate, .5);
  });
});

function displayAmplitudes(pcmdata, sampleRate, interval) {
  step = sampleRate * interval
  n = Math.floor(pcmdata.length / step);
  amplitudes = [];

  for (let i = 0; i < n; i++) {
    max = -Infinity;
    sum = 0;
    for (let k = 0; k < step; k++) {
      max = pcmdata[(i + 1) * k] > max ? pcmdata[(i + 1) * k].toFixed(1) : max;
      //sum += pcmdata[(i + 1) * k];
    }
    //amplitudes.push(Math.abs(sum/step));
    amplitudes.push(max);
  }

  let average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
  let a = average(amplitudes);
  amplitudes = amplitudes.map((value, index) => {
    let n = value > a ? 1 : 0;
  });
}