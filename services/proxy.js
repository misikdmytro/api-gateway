const ChainProcessor = require('../processors/chain')
const SecurityProcessor = require('../processors/security')
const HeadersProcessor = require('../processors/headers')
const BodyProcessor = require('../processors/body')
const UrlProcessor = require('../processors/url')
const LimiterProcessor = require('../processors/limiter')
const ExecutorProcessor = require('../processors/executor')
const CacheProcessor = require('../processors/cache')

const routes = require('../routes/routes.json')

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
module.exports = function handler(req) {
    const { path, method } = req

    const route = routes.find(
        (route) =>
            route.context.some((c) => path.startsWith(c)) &&
            route.methods.includes(method)
    )
    if (!route || route?.internal) {
        return {
            response: {
                status: 404,
                body: {
                    error: 'route_not_found',
                    message: 'route not found',
                },
            },
        }
    }

    const chain = new ChainProcessor()
    chain.add(new HeadersProcessor(route, req))
    chain.add(new BodyProcessor(req))
    chain.add(new UrlProcessor(route, req))
    if (route.security) {
        chain.add(new SecurityProcessor(route, req))
    }
    if (route.limits) {
        chain.add(new LimiterProcessor(route))
    }
    if (route.cache) {
        chain.add(new CacheProcessor(route))
    }
    chain.add(new ExecutorProcessor(route))

    return chain.process({
        authorization: req.headers.authorization,
    })
}
