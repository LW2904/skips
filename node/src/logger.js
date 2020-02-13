const pino = require('pino');

const log = pino({
    level: 10,
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

exports.log = log;
