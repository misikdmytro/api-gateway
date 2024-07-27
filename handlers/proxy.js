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
        const { error, message, response } = await service(req)

        if (error) {
            if (error === service.errors.ROUTE_NOT_FOUND) {
                res.status(404).json({ error, message }).send()
            } else {
                res.status(500).json({ error, message }).send()
            }

            return
        }

        res.status(response.status)
        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value)
        }

        res.send(response.body)
    } catch (err) {
        next(err)
    }
}
