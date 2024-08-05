const fetch = require('node-fetch')
const ChainFilter = require('../filters/chain')
const SecurityHandler = require('../filters/security')

const routes = require('../routes/routes.json')

const errors = {
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
}

const defaultTimeout = parseInt(process.env.HTTP_DEFAULT_TIMEOUT) || 5000
const nonBodyMethods = ['GET', 'HEAD']

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

    const route = routes.find(
        (route) =>
            route.context.some((c) => path.startsWith(c)) &&
            route.methods.includes(method)
    )
    if (!route || route?.internal) {
        return {
            error: errors.ROUTE_NOT_FOUND,
            message: 'route not found',
        }
    }

    const chain = new ChainFilter()
    if (route.security) {
        chain.add(new SecurityHandler(route))
    }

    const filterResult = chain.process({
        authorization: req.headers.authorization,
    })
    if (!filterResult.result) {
        return { error: filterResult.error, message: filterResult.message }
    }

    const servicePath = Object.entries(route.pathRewrite).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(key), value),
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
        'X-Forwarded-Name': route.name,
        'X-Request-Id': req.id,
    }

    const reqBody = nonBodyMethods.includes(method) ? undefined : body

    const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: reqBody,
        follow: 0,
        timeout: route?.timeout || defaultTimeout,
    })

    return {
        response,
    }
}

module.exports = handler
module.exports.errors = errors
