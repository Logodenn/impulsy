const winston = require('winston');
var path = require('path');

<<<<<<< HEAD
const baseDir = __dirname.slice(0, __dirname.length - "utils".length);
=======
const baseDir = __dirname.slice(0, __dirname.length - 5);
>>>>>>> a26529e429d0be50a659544b64e5df79c78445ce
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