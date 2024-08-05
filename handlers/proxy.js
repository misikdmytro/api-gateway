const service = require('../services/proxy')
const { errors: securityErrors } = require('../processors/security')

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
            } else if (error === securityErrors.FORBIDDEN) {
                res.status(403).json({ error, message }).send()
            } else if (error === securityErrors.UNATHORIZED) {
                res.status(401).json({ error, message }).send()
            } else {
                res.status(500).json({ error, message }).send()
            }

            return
        }

        res.status(response.status)
        response.headers.forEach((value, key) => res.setHeader(key, value))

        const content = await response.buffer()
        res.send(content)
    } catch (err) {
        next(err)
    }
}
