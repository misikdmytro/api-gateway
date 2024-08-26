const fetch = require('node-fetch')

const ChainProcessor = require('../processors/chain')
const SecurityProcessor = require('../processors/security')
const HeadersProcessor = require('../processors/headers')
const BodyProcessor = require('../processors/body')
const UrlProcessor = require('../processors/url')
const LimiterProcessor = require('../processors/limiter')

const routes = require('../routes/routes.json')

const errors = {
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
}

const defaultTimeout = parseInt(process.env.HTTP_DEFAULT_TIMEOUT) || 5000

/**
 * @typedef {import('node-fetch').Response} Response
 * @typedef Result
 * @property {Response} response
 */

/**
 * Method proxies the request to the appropriate service
 * @typedef {import('express').Request} Request
 * @param {Request} req
 * @returns {Promise<Result>}
 */
async function handler(req) {
    const { path, method } = req

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

    const chain = new ChainProcessor()
    chain.add(new BodyProcessor(req))
    chain.add(new UrlProcessor(route, req))
    chain.add(new HeadersProcessor(route, req))
    if (route.security) {
        chain.add(new SecurityProcessor(route, req))
    }
    if (route.limits) {
        chain.add(new LimiterProcessor(route))
    }

    const processorResult = await chain.process({
        authorization: req.headers.authorization,
    })
    if (!processorResult.result) {
        return {
            response: processorResult.response,
        }
    }

    const response = await fetch(processorResult.url, {
        method,
        headers: processorResult.headers,
        body: processorResult.body,
        follow: 0,
        timeout: route?.timeout || defaultTimeout,
    })

    return {
        response,
    }
}

module.exports = handler
module.exports.errors = errors
