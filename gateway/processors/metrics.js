const client = require('prom-client')

const requestsTotal = new client.Counter({
    name: 'requests_total',
    help: 'Total number of requests',
    labelNames: ['method', 'route_name', 'status', 'user_agent', 'ip'],
})

const requestDuration = new client.Summary({
    name: 'requests_duration_ms',
    help: 'Duration of requests in ms',
    labelNames: ['method', 'route_name', 'status'],
})

const requestsDurationHistogram = new client.Histogram({
    name: 'requests_duration_histogram_ms',
    help: 'Duration of requests in ms',
    labelNames: ['method', 'route_name', 'status'],
    buckets: [10, 50, 100, 500, 1000, 5000], // Custom buckets for request duration
})

const requestsSize = new client.Histogram({
    name: 'outgoing_requests_size_bytes',
    help: 'Size of outgoing requests in bytes',
    labelNames: ['method', 'route_name', 'status'],
    buckets: [512, 1024, 2048, 4096, 8192], // Custom buckets for request size
})

const activeRequests = new client.Gauge({
    name: 'active_requests',
    help: 'Number of active requests',
})

module.exports = class MetricsProcessor {
    /**
     * Creates a new metrics processor
     * @typedef {import('express').Request} Request
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
        this.__userAgent = req.headers['user-agent'] || 'unknown'
        this.__ip = req.ip || 'unknown'
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Promise<Result>}
     */
    async process() {
        activeRequests.inc() // Increment active requests gauge

        const start = process.hrtime()
        return { context: { start } }
    }

    /**
     * Post-processes the request
     * @param {import('./types').Response} response
     * @returns {Promise<void>}
     */
    postProcess(context, response) {
        return this.__handle(context, response)
    }

    /**
     * Handles errors in the request
     * @param {Error} error
     * @param {object} context
     * @returns {Promise<void>}
     */
    async handleError(error, context) {
        return this.__handle(context, { status: 500 })
    }

    async __handle(context, response) {
        const end = process.hrtime(context.start)
        const durationMs = end[0] * 1000 + end[1] / 1e6

        // Record the duration of the request
        requestDuration
            .labels(this.__req.method, this.__route.name, response.status)
            .observe(durationMs)

        // Record the duration of the request in a histogram
        requestsDurationHistogram
            .labels(this.__req.method, this.__route.name, response.status)
            .observe(durationMs)

        // Record size of the response
        requestsSize
            .labels(this.__req.method, this.__route.name, response.status)
            .observe(Buffer.byteLength(response.body || '', 'utf8'))

        // Update the request count with final status
        requestsTotal
            .labels(
                this.__req.method,
                this.__route.name,
                response.status,
                this.__userAgent,
                this.__ip
            )
            .inc()

        activeRequests.dec() // Decrement active requests gauge after completion
    }
}
