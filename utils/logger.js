const winston = require('winston')

const baseDir = __dirname.slice(0, __dirname.length - '/utils'.length)
const tsFormat = () => (new Date()).toLocaleTimeString()

const logger = (_module) => {
  return new (winston.Logger)({
    levels: {
      info: 0,
      debug: 1,
      error: 2
    },
    transports: [
      // colorize the output to the console
      new (winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true,
        label: _module.filename.slice(baseDir.length),
        level: 'error'
      })
    ]
  })
}

logger.level = 'debug'

module.exports = logger
