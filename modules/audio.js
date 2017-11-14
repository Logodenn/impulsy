const logger = require('../utils/logger')(module)
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const ytdl = require('ytdl-core')
const streamTo = require('stream-to-array')
const AudioContext = require('web-audio-api').AudioContext

const youtubeBaseUrl = 'https://www.youtube.com/watch?v='
const audioContext = new AudioContext()

/**
 * provides information on a specific videoId
 *
 * @param {String} _videoId
 * @param {Function} _callback
 */
const getInfo = (_videoId, _callback) => {
  ytdl.getInfo(`${youtubeBaseUrl}${_videoId}`, (err, info) => {
    const data = {
      title: info.title,
      duration: info.length_seconds
    }

    _callback(err, data)
  })
}

/**
 * provides the ffmpeg stream of the mp3 data
 *
 * @param {any} _source
 * @param {Function} _callback
 */
const getStream = (_source, _callback) => {
  let stream = ffmpeg({
    source: _source
  })

  stream.noVideo()
    .format('mp3')

  _callback(null, stream)
}

/**
 * allows to get the mp3 stream of a local file
 * The 'fileName' option is required
 *
 * @param {Object} _options
 * @param {Function} _callback
 */
const getLocalStream = (_options, _callback) => {
  if (!_options.fileName) {
    logger.error('getYoutubeStream: no videoId provided')

    return _callback(new Error('No youtube video Id provided'))
  }

  // We might want to set up a directory for files
  const source = path.join(__dirname, '..', 'sounds', _options.fileName)

  getStream(source, _callback)
}

/**
 * allows to get the mp3 stream of a specific youtube video
 * The 'videoId' option is required
 * The 'quality' option defaults to 'highest'
 *
 * @param {Object} _options
 * @param {Function} _callback
 */
const getYoutubeStream = (_options, _callback) => {
  if (!_options.videoId) {
    // logger.err('getYoutubeStream: no videoId provided')
    _callback(new Error('No youtube video Id provided'))
    return
  }

  _options.quality = _options.quality || 'highest'

  const source = ytdl(`${youtubeBaseUrl}${_options.videoId}`, {
    quality: _options.quality,
    format: 'audioonly'
  })

  getStream(source, _callback)
}

/**
 * computes de amplitudes of an audio stream
 * '_stream' should be an audio stream
 * '_frequency' is the number of amplitudes in Hz
 *
 * @param {ReadableStream} _stream
 * @param {Number} _frequency
 * @param {Function} _callback
 */
const getAmplitudes = (_stream, _frequency, _callback) => {
  streamTo(_stream.pipe(), (err, parts) => {
    if (err) {
      return _callback(err)
    }

    const buffers = parts.map(part => Buffer.isBuffer(part) ? part : Buffer.from(part))
    const buffer = Buffer.concat(buffers)

    audioContext.decodeAudioData(buffer, function (audioBuffer) {
      const pcmdata = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate
      // const duration = audioBuffer.duration

      // Compute bars
      let amplitudes = []

      const step = sampleRate / _frequency
      const n = Math.floor(pcmdata.length / step)

      for (let i = 0; i < n; i++) {
        let sum = 0

        for (let k = 0; k < step; k++) {
          sum += pcmdata[i * step + k]
        }

        amplitudes.push(Math.abs(sum / step))
      }

      // Normalize amplitudes
      const ratio = Math.max(...amplitudes)

      amplitudes = amplitudes.map(v => Number((v / ratio).toFixed(2)))

      _callback(null, amplitudes)
    })
  })
}

module.exports = {
  getAmplitudes,
  getInfo,
  getLocalStream,
  getYoutubeStream
}
