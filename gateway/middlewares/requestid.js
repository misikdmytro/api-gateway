const { v4: uuidv4 } = require('uuid')

/**
 * Request ID middleware
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
module.exports = (req, res, next) => {
    req.id = uuidv4()
    res.setHeader('X-Request-Id', req.id)
    next()
}
