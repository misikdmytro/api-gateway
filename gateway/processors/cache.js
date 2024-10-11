const { getRedisClient } = require('../clients/cache')
const client = require('prom-client')

// Counter for cache hits
const cacheHits = new client.Counter({
    name: 'cache_hits_total',
    help: 'The total number of cache hits',
})

// Counter for cache misses
const cacheMisses = new client.Counter({
    name: 'cache_misses_total',
    help: 'The total number of cache misses',
})

module.exports = class CacheProcessor {
    /**
     * Creates a new cache processor
     * @typedef {import('express').Request} Request
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Promise<Result>}
     */
    async process() {
        const cl = await getRedisClient()

        const cachedResponse = await cl.get(this.__buildKey())
        if (cachedResponse) {
            cacheHits.inc()

            const response = JSON.parse(cachedResponse)
            response.content = Buffer.from(response.content.data)

            return { context: { cached: true }, response }
        }

        cacheMisses.inc()
        return {}
    }

    /**
     * Post-processes the request
     * @param {import('./types').Response} response
     * @returns {Promise<void>}
     */
    async postProcess(context, response) {
        if (!context.cached) {
            const { cache } = this.__route

            if (response.status >= 200 && response.status < 300) {
                const cl = await getRedisClient()
                await cl.setEx(
                    this.__buildKey(),
                    cache.ttl,
                    JSON.stringify(response)
                )
            }
        }
    }

    __buildKey() {
        return this.__req.originalUrl
    }
}
