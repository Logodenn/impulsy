const logger = require('../utils/logger')(module)
const audio = require('./audio')
const Youtube = require('youtube-node')

const yt = new Youtube()

yt.setKey(process.env.YOUTUBE_API_KEY)

const search = (_opts, _callback) => {
  yt.clearParams()

  yt.search(_opts.keywords, _opts.tracksCount, { type: 'video', videoDuration: 'short' }, (err, data) => {
    if (err) {
      logger.error('search - Failed to search for Youtube tracks')

      return _callback(err)
    }
    _callback(err, data)
  })
}

/**
 * fetch the trending music tracks on youtube
 * '_maxTracks' is the number of tracks to fetch
 * @param {Number} _tracksCount
 * @param {Function} _callback
 */
const getTrendingTracks = (_tracksCount, _callback) => {
  yt.clearParams()

  yt.getMostPopularByCategory(_tracksCount, 10, (err, data) => {
    if (err) {
      logger.error(err)

      return _callback(err)
    }

    let tracks = []

    data.items.forEach((element) => {
      audio.getInfo(element.id, (err, info) => {
        if (err) {
          return logger.error(err)
        }

        tracks.push(info)

        if (tracks.length >= _tracksCount) {
          _callback(null, tracks)
        }
      })
    })
  })
}

module.exports = {
  getTrendingTracks,
  search
}
