const ffmpeg = require('fluent-ffmpeg')
const ytdl = require('ytdl-core')
const streamTo = require('stream-to-array')
const AudioContext = require('web-audio-api').AudioContext

const context = new AudioContext()
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
    let sum = 0

    for (let k = 0; k < step; k++) {
      sum += pcmdata[i * step + k]
    }

    amplitudes.push(Math.abs(sum / step))
  }

  let average = getArrayAverage(amplitudes)

  amplitudes = amplitudes.map((value, index) => {
    let n = value > average ? 1 : 0
    return n
  })

  return amplitudes
}

function getArrayAverage (array) {
  const sum = array.reduce((p, c) => {
    return p + c
  }, 0)

  return sum / array.length
}
