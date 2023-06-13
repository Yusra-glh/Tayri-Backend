const pino = require('pino');
const logger = pino({
    level: "debug",
    timestamp: pino.stdTimeFunctions.isoTime
});
module.exports = logger;