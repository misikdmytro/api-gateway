const fetch = require('node-fetch')

const routes = require('../routes/routes.json')

const errors = {
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
}

/**
 * @typedef {import('node-fetch').Response} Response
 * @typedef Result
 * @property {string} error
 * @property {string} message
 * @property {Response} response
 */

/**
 * Method proxies the request to the appropriate service
 * @typedef {import('express').Request} Request
 * @param {Request} req
 * @returns {Promise<Result>}
 */
async function handler(req) {
    const { path, method, headers, body, ip } = req

    const route = routes.find((route) =>
        route.context.some((c) => path.startsWith(c))
    )
    if (!route) {
        return {
            error: errors.ROUTE_NOT_FOUND,
            message: 'route not found',
        }
    }

    const servicePath = Object.entries(route.pathRewrite).reduce(
        (acc, [key, value]) => acc.replace(key, value),
        path
    )

    const url = `${route.target}${servicePath}`
    const reqHeaders = {
        ...headers,
        'X-Forwarded-For': ip,
        'X-Forwarded-Proto': req.protocol,
        'X-Forwarded-Port': req.socket.localPort,
        'X-Forwarded-Host': req.hostname,
        'X-Forwarded-Path': req.baseUrl,
        'X-Forwarded-Method': method,
        'X-Forwarded-Url': req.originalUrl,
        'X-Forfarded-By': 'api-gateway',
    }

    const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body,
        follow: false,
        timeout: route?.timeout || 5000,
    })

    return {
        response,
    }
}

module.exports = handler
module.exports.errors = errors