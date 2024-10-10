const { getRedisClient } = require('../clients/cache')

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
            return { response: cachedResponse }
        }
    }

    /**
     * Post-processes the request
     * @param {import('./types').Response} response
     * @returns {Promise<void>}
     */
    async postProcess(response) {
        const { cache } = this.__route

        if (response.status >= 200 && response.status < 300) {
            const cl = await getRedisClient()
            await cl.set(this.__buildKey(), response, 'EX', cache.ttl)
        }
    }

    __buildKey() {
        return Object.entries(this.__req.params).reduce(
            (acc, [key, value]) => acc.replace(new RegExp(`:${key}`), value),
            this.__route.cache.keyPattern
        )
    }
}
