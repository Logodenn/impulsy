/* global FileReader, Blob */

var chunkPlayer = {
  _audioContext: undefined,
  _audioBuffer: [],
  _startTime: undefined,
  _timer: undefined,
  _lastBufferDuration: 0,
  _playedChunk: 0,
  _source: undefined,
  _playing: false,
  _blob: undefined,

  /**
   * Pushes a new chunk into the audio buffer
   * @function
   */
  _onAudioChunk: function onAudioChunk (chunk) {
    chunkPlayer._audioBuffer.push(chunk)
  },

  /**
   * Stop playing audio and clear audio data
   * @function
   */
  _stop: function stop () {
    clearInterval(chunkPlayer._timer)

    chunkPlayer._audioBuffer = []
    chunkPlayer._lastBufferDuration = 0
    chunkPlayer._playedChunk = 0
    chunkPlayer._playing = false

    if (chunkPlayer._source) {
      chunkPlayer._source.stop()
    }
  },

  /**
   * Start playing the recorded audio
   * @function
   */
  _start: function start () {
    chunkPlayer._audioContext = new (window.AudioContext || window.webkitAudioContext)()
    chunkPlayer._startTime = chunkPlayer._audioContext.currentTime

    chunkPlayer._playNextChunk()
    chunkPlayer._timer = setInterval(chunkPlayer._playNextChunk, 500)
  },

  /**
   * Plays a chunk of audio
   * @function
   */
  _playNextChunk: function playNextChunk () {
    if (chunkPlayer._playedChunk > chunkPlayer._audioBuffer.length) {
      clearInterval(chunkPlayer._timer)
    } else {
      var chunkCount = chunkPlayer._audioBuffer.length
      var fileReader = new FileReader()

      chunkPlayer._blob = new Blob(chunkPlayer._audioBuffer)

      fileReader.readAsArrayBuffer(chunkPlayer._blob)
      fileReader.onloadend = function () {
        chunkPlayer._audioContext.decodeAudioData(this.result, function (buffer) {
          if (chunkPlayer._playing) {
            chunkPlayer._source.stop(0.015)
            chunkPlayer._playing = false
          }

          chunkPlayer._source = chunkPlayer._audioContext.createBufferSource()
          chunkPlayer._source.buffer = buffer
          chunkPlayer._source.connect(chunkPlayer._audioContext.destination)
          chunkPlayer._source.start(0.010, chunkPlayer._audioContext.currentTime + 0.010 || 0 - chunkPlayer._startTime)

          chunkPlayer._playing = true
          chunkPlayer._playedChunk = chunkCount
        })
      }
    }
  }
}
