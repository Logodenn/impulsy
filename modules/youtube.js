const util = require('util');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const streamTo = require('stream-to-array');
const AudioContext = require('web-audio-api').AudioContext;

const context = new AudioContext;

module.exports.getAudioStream = (source, local, callback) => {
  if(!local) {
    const source = ytdl('https://www.youtube.com/watch?v=' + source, { quality: 'lowest', format: 'audioonly' });
    source.on('error', (err) => {
      callback(err);
      return;
    });
  }

  let stream = ffmpeg({ source: source });
  stream.noVideo()
      .audioBitrate('1k')
      .format('mp3');

  callback(null, stream);
};

module.exports.getBars = (stream, frequency, callback) => {
  let pipe = stream.pipe();

  streamTo(pipe, (err, parts) => {
    if (err) {
      callback(err);
      return;
    }

    const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part));
    const buff = Buffer.concat(buffers);

    context.decodeAudioData(buff, function(audioBuffer) {
      const pcmdata = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      const bars = computeBars(pcmdata, sampleRate, 1.0 / frequency);

      callback(null, bars);
    });
  });
}

function computeBars(pcmdata, sampleRate, interval) {
  step = sampleRate * interval
  n = Math.floor(pcmdata.length / step);
  amplitudes = [];

  for (let i = 0; i < n; i++) {
    max = -Infinity;
    sum = 0;
    for (let k = 0; k < step; k++) {
      //max = pcmdata[(i + 1) * k] > max ? pcmdata[(i + 1) * k].toFixed(1) : max;
      sum += pcmdata[(i + 1) * k];
    }
    amplitudes.push(Math.abs(sum/step));
    //amplitudes.push(max);
  }

  let average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
  let a = average(amplitudes);
  amplitudes = amplitudes.map((value, index) => {
    let n = value > a ? 1 : 0;
    return n;
  });

  return amplitudes;
}