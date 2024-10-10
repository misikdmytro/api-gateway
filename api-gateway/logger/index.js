const winston = require('winston')

/**
 * Logger
 * @typedef {import('winston').Logger} Logger
 */
module.exports = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'api-gateway' },
    transports: [new winston.transports.Console()],
})
