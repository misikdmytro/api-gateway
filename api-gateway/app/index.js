const express = require('express')
const error = require('../middlewares/error')
const logger = require('../middlewares/logger')
const requestId = require('../middlewares/requestid')

/**
 * Build Express application
 * @param {Function} [callback]
 * @returns {import('express').Express}
 */
module.exports = (callback = () => {}) => {
    const app = express()

    app.use(requestId)
    app.use(express.raw({ type: '*/*' }))
    app.use(logger)

    app.get('/health', require('../handlers/health'))
    app.all('*', require('../handlers/proxy'))

    callback(app)

    app.use(error)

    return app
}
