const winston = require('winston')

/**
 * Logger
 * @typedef {import('winston').Logger} Logger
 */
module.exports = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'api-gateway' },
    transports: [new winston.transports.Console()],
})
