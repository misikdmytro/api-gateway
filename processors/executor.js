const fetch = require('node-fetch')

const defaultTimeout = parseInt(process.env.HTTP_DEFAULT_TIMEOUT) || 5000

module.exports = class ExecutorProcessor {
    /**
     * Creates a new executor processor
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     */
    constructor(route) {
        this.__route = route
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    async process(context) {
        const response = await fetch(context.url, {
            method: context.method,
            headers: context.headers,
            body: context.body,
            follow: 0,
            timeout: this.__route?.timeout || defaultTimeout,
        })

        return { response }
    }
}
