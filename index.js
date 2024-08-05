const buildApp = require('./app')
const logger = require('./logger')

require('cache/clients') // just to start the cache

const dotenv = require('dotenv')
dotenv.config()

const app = buildApp()

app.listen(3000, () => {
    logger.info('API Gateway started', { port: 3000 })
})
