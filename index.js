const express = require('express');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'api-gateway' },
    transports: [
        new winston.transports.Console(),
    ],
});

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    logger.info('API Gateway listening', { port: 3000 });
});