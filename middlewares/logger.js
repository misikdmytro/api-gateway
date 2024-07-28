const logger = require('../logger')

/**
 * Logger middleware
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
module.exports = (req, res, next) => {
    const start = Date.now()
    const { method, url } = req

    res.on('finish', () => {
        const ms = Date.now() - start
        logger.debug(`Method executed`, {
            method,
            url,
            statusCode: res.statusCode,
            ms,
            requestId: req.id,
        })
    })

    logger.debug(`Method called`, {
        method,
        url,
        requestId: req.id,
    })

    next()
}
