const { getRedisClient } = require('../clients/limiter')

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
            if (type === 'client') {
                const result = await this.__handleClientRateLimit(context, rate, window)
                if (result) {
                    return result
                }
            } else if (type === 'overall') {
                const result = await this.__handleOverallRateLimit(rate, window)
                if (result) {
                    return result
                }
            } else {
                return {
                    result: false,
                    response: {
                        status: 500,
                        body: {
                            error: 'internal_server_error',
                            message: 'unsupported rate limit type',
                        }
                    }
                }
            }
        }

        return { result: true }
    }

    async __handleClientRateLimit(context, rate, window) {
        const client = context.client
        if (!client) {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'missing client context',
                    }
                }
            }
        }

        const { timeframe, reset, after } = this.__getTimeWindow(window)

        const cl = await getRedisClient()
        const key = `client:${client.client_id}:${this.__route.name}:${timeframe}`

        const res = await cl.incr(key)
        const current = res.valueOf()
        if (current > rate) {
            return this.__buildRateLimitExceededResponse('client', rate, reset, after)
        }

        return this.__buildSuccessfulResponse(reset, rate - current)
    }

    async __handleOverallRateLimit(rate, window) {
        const { timeframe, reset, after } = this.__getTimeWindow(window)

        const cl = await getRedisClient()
        const key = `overall:${this.__route.name}:${timeframe}`

        const res = await cl.incr(key)
        const current = res.valueOf()
        if (current > rate) {
            return this.__buildRateLimitExceededResponse('overall', rate, reset, after)
        }

        return this.__buildSuccessfulResponse(reset, rate - current)
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
            status: 429,
            headers: {
                'X-RateLimit-Type': type,
                'X-RateLimit-Limit': rate,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': reset,
                'Retry-After': after,
            },
            body: {
                error: 'rate_limit_exceeded',
                message: 'rate limit exceeded',
            }
        }
    }

    __buildSuccessfulResponse(reset, remaining) {
        return {
            status: 200,
            headers: {
                'X-RateLimit-Remaining': remaining,
                'X-RateLimit-Reset': reset,
            }
        }
    }
}
