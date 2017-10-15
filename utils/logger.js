const winston = require('winston');
var path = require('path');

const baseDir = __dirname.slice(0, __dirname.length - "utils".length);
const tsFormat = () => (new Date()).toLocaleTimeString();

const logger = (_module) => {
    return new(winston.Logger)({
        transports: [
            // colorize the output to the console
            new(winston.transports.Console)({
                timestamp: tsFormat,
                colorize: true,
                label: require.main.filename.slice(baseDir.length)
            })
        ]
    });
};

module.exports = logger;