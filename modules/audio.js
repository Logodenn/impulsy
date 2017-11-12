const logger = require('../utils/logger')(module)
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const ytdl = require('ytdl-core')

const youtubeBaseUrl = 'https://www.youtube.com/watch?v='

/**
 * provides the ffmpeg stream of the mp3 data
 * @param {any} _source
 * @param {any} _callback
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
 * @param {any} options
 * @param {any} callback
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
 * @param {any} _options
 * @param {any} _callback
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

module.exports = {
  getLocalStream,
  getYoutubeStream
}
