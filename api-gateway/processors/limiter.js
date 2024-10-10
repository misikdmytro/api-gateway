const { getRedisClient } = require('../clients/cache')
const { stringifyToBuffer } = require('../utils')

module.exports = class LimiterProcessor {
    /**
     * Creates a new rate limiter processor
     * @param {import('./types').Route} route
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
        const { limits } = this.__route

        for (const [type, { rate, window }] of Object.entries(limits)) {
            let handler
            if (type === 'client') {
                handler = this.__handleClientRateLimit.bind(this)
            } else if (type === 'overall') {
                handler = this.__handleOverallRateLimit.bind(this)
            } else {
                return {
                    response: {
                        status: 500,
                        content: stringifyToBuffer({
                            error: 'internal_server_error',
                            message: 'unsupported rate limit type',
                        }),
                        headers: {
                            'content-type': 'application/json',
                        },
                    },
                }
            }

            const result = await handler(context, rate, window)
            if (!result.result) {
                return result
            }
        }

        return { result: true }
    }

    async __handleClientRateLimit(context, rate, window) {
        const client = context.client
        if (!client) {
            return {
                response: {
                    status: 401,
                    content: stringifyToBuffer({
                        error: 'unauthorized',
                        message: 'missing client context',
                    }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        const { timeframe, reset, after } = this.__getTimeWindow(window)

        const cl = await getRedisClient()
        const key = `client:${client.client_id}:${this.__route.name}:${timeframe}`

        const res = await cl.incr(key)
        const current = res.valueOf()
        if (current > rate) {
            return this.__buildRateLimitExceededResponse(
                'client',
                rate,
                reset,
                after
            )
        }

        return this.__buildSuccessfulResponse()
    }

    async __handleOverallRateLimit(rate, window) {
        const { timeframe, reset, after } = this.__getTimeWindow(window)

        const cl = await getRedisClient()
        const key = `overall:${this.__route.name}:${timeframe}`

        const res = await cl.incr(key)
        const current = res.valueOf()
        if (current > rate) {
            return this.__buildRateLimitExceededResponse(
                'overall',
                rate,
                reset,
                after
            )
        }

        return this.__buildSuccessfulResponse()
    }

    __getTimeWindow(window) {
        const now = Math.floor(new Date().getTime() / 1000)
        const timeframe = Math.floor(now / window)
        const reset = (timeframe + 1) * window
        const after = reset - now

        return { now, timeframe, reset, after }
    }

    __buildRateLimitExceededResponse(type, rate, reset, after) {
        return {
            response: {
                status: 429,
                headers: {
                    'content-type': 'application/json',
                    'X-RateLimit-Type': type,
                    'X-RateLimit-Limit': rate,
                    'X-RateLimit-Remaining': 0,
                    'X-RateLimit-Reset': reset,
                    'Retry-After': after,
                },
                content: stringifyToBuffer({
                    error: 'rate_limit_exceeded',
                    message: 'rate limit exceeded',
                }),
            },
        }
    }

    __buildSuccessfulResponse() {
        return {}
    }
}
