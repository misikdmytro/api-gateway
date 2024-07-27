const buildApp = require('./app')
const logger = require('./logger')

const app = buildApp()

app.listen(3000, () => {
    logger.info('API Gateway started', { port: 3000 })
})
