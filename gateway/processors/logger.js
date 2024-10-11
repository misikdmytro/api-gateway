const logger = require('../logger')

module.exports = class LoggerProcessor {
    /**
     * Creates a new logger processor
     * @typedef {import('express').Request} Request
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
        this.__requestId = req.id
        this.__url = req.url
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Promise<Result>}
     */
    async process() {
        logger.info('Processing request', {
            route: this.__route.name,
            method: this.__req.method,
            requestId: this.__requestId,
            url: this.__url,
        })

        return {}
    }

    /**
     * Post-processes the request
     * @param {import('./types').Response} response
     * @returns {Promise<void>}
     */
    postProcess(context, response) {
        const length = Buffer.byteLength(response.content || '', 'utf8')

        logger.info('Processed request', {
            route: this.__route.name,
            method: this.__req.method,
            requestId: this.__requestId,
            url: this.__url,
            status: response.status,
            length,
        })
    }

    /**
     * Handles errors in the request
     * @param {Error} error
     * @returns {Promise<void>}
     */
    async handleError(error) {
        logger.error('Error processing request', {
            route: this.__route.name,
            method: this.__req.method,
            requestId: this.__requestId,
            url: this.__url,
            error: error.message,
        })
    }
}
