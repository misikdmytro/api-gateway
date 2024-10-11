const { trace, context } = require('@opentelemetry/api')

const tracer = trace.getTracer('gateway-proxy')

module.exports = class TracesProcessor {
    /**
     * Creates a new traces processor
     * @typedef {import('express').Request} Request
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
        this.__span = null
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Promise<Result>}
     */
    async process() {
        // Start a span for the incoming request
        const activeSpan = trace.getSpan(context.active())

        this.__span = tracer.startSpan('action_processing', {
            attributes: {
                'http.method': this.__req.method,
                'http.url': this.__req.originalUrl,
                'http.user_agent': this.__req.headers['user-agent'],
                'http.ip': this.__req.ip,
                'gateway.route': this.__route.name,
            },
            parent: activeSpan,
        })

        this.__span.addEvent('request_received')

        return {}
    }

    /**
     * Post-processes the request after the result has been obtained
     * @param {object} context
     * @param {import('./types').Response} response
     * @returns {Promise<void>}
     */
    async postProcess(context, response) {
        if (this.__span) {
            this.__span.setAttribute('http.status_code', response.status)
            this.__span.addEvent('response_sent')
            this.__span.end() // End the span after processing is complete
        }
    }

    /**
     * Handles errors in the request
     * @param {Error} error
     * @param {object} context
     * @returns {Promise<void>}
     */
    async handleError(error) {
        if (this.__span) {
            this.__span.recordException(error) // Record the exception in the span
            this.__span.setAttribute('http.status_code', 500) // Set HTTP status code to 500 for error
            this.__span.addEvent('error_handled')
            this.__span.end() // End the span even in case of an error
        }
    }
}
