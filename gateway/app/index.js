const express = require('express')
const client = require('prom-client')

const error = require('../middlewares/error')
const logger = require('../middlewares/logger')
const requestId = require('../middlewares/requestid')

client.collectDefaultMetrics()

/**
 * Build Express application
 * @param {Function} [callback]
 * @returns {import('express').Express}
 */
module.exports = (callback = () => { }) => {
    const app = express()

    app.use(requestId)
    app.use(express.raw({ type: '*/*' }))
    app.use(logger)

    app.get('/health', require('../handlers/health'))
    app.get('/metrics', async (_, res) => {
        res.set('Content-Type', client.register.contentType)
        res.end(await client.register.metrics())
    })
    app.all('*', require('../handlers/proxy'))

    callback(app)

    app.use(error)

    return app
}
