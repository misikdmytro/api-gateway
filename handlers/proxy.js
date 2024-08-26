const service = require('../services/proxy')

/**
 * Proxy handler
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
module.exports = async (req, res, next) => {
    try {
        const { response } = await service(req)

        res.status(response.status)
        response.headers.forEach((value, key) => res.setHeader(key, value))

        if (response.buffer && typeof response.buffer === 'function') {
            const content = await response.buffer()
            res.send(content)
        } else if (response.body) {
            res.json(response.body)
        }
    } catch (err) {
        next(err)
    }
}
