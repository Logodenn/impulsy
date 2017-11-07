const util = require('util')
const ffmpeg = require('fluent-ffmpeg')
const ytdl = require('ytdl-core')
const streamTo = require('stream-to-array')
const AudioContext = require('web-audio-api').AudioContext

const context = new AudioContext
const youtubeBaseUrl = 'https://www.youtube.com/watch?v='

module.exports = {
  getInfo: (youtubeVideoId, callback) => {
    ytdl.getInfo(youtubeBaseUrl + youtubeVideoId, (err, info) => {
      const data = {
        title: info.title,
        duration: info.length_seconds
      }

      callback(err, data)
    })
  },

  getAudioStream: (source, local, quality, callback) => {
    let error = null

    if (!local) {
      source = ytdl(youtubeBaseUrl + source, {
        quality: quality,
        format: 'audioonly'
      })
      source.on('error', (err) => {
        callback(err)
        error = err
      })
    }

    if (!error) {
      let stream = ffmpeg({
        source: source
      })
      stream.noVideo()
        .format('mp3')

      callback(null, stream)
    }
  },

  getBars: (stream, frequency, callback) => {
    let pipe = stream.pipe()

    streamTo(pipe, (err, parts) => {
      if (err) {
        callback(err)

        return
      }

      const buffers = parts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
      const buff = Buffer.concat(buffers)

      context.decodeAudioData(buff, function (audioBuffer) {
        const pcmdata = audioBuffer.getChannelData(0)
        const sampleRate = audioBuffer.sampleRate
        // const duration = audioBuffer.duration

        const bars = computeBars(pcmdata, sampleRate, 1.0 / frequency)

        callback(null, bars)
      })
    })
  }
}

function computeBars (pcmdata, sampleRate, interval) {
  const step = sampleRate * interval
  const n = Math.floor(pcmdata.length / step)
  let amplitudes = []

  for (let i = 0; i < n; i++) {
    // let max = -Infinity
    let sum = 0
    for (let k = 0; k < step; k++) {
      // max = pcmdata[(i + 1) * k] > max ? pcmdata[(i + 1) * k].toFixed(1) : max;
      sum += pcmdata[(i + 1) * k]
    }
    amplitudes.push(Math.abs(sum / step))
    // amplitudes.push(max);
  }

  let getAverage = arr => arr.reduce((p, c) => p + c, 0) / arr.length
  let average = getAverage(amplitudes)

  amplitudes = amplitudes.map((value, index) => {
    let n = value > average ? 1 : 0
    return n
  })

  return amplitudes
}
