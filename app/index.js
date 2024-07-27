const express = require('express')
const error = require('../middlewares/error')
const logger = require('../middlewares/logger')

module.exports = (callback = () => {}) => {
    const app = express()

    app.use(express.raw())
    app.use(logger)

    app.get('/health', require('../handlers/health'))
    app.all('*', require('../handlers/proxy'))

    callback(app)

    app.use(error)

    return app
}
