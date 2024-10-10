const logger = require('../logger')

/**
 * Error handler middleware
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @param {Error} error
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
module.exports = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    logger.error(`Error occurred`, {
        method: req.method,
        url: req.url,
        error,
    })

    res.status(500).json({ error: 'Internal Server Error' }).send()
}
