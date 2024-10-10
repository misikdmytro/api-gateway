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
        if (response.headers) {
            Object.entries(response.headers).forEach(([key, value]) =>
                res.setHeader(key, value)
            )
        }

        res.send(response.content)
    } catch (err) {
        next(err)
    }
}
