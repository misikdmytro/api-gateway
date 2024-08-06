module.exports = class HeadersProcessor {
    /**
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
     * @returns {Result}
     */
    process() {
        const {
            headers,
            ip,
            protocol,
            socket,
            hostname,
            baseUrl,
            method,
            originalUrl,
            id,
        } = this.__req

        const { name } = this.__route

        var reqHeaders = {}

        for (const [key, value] of Object.entries(headers)) {
            if (key === 'authorization' && this.__route.security) {
                // skip
                continue
            }

            reqHeaders[key] = value
        }

        return {
            result: true,
            headers: {
                ...reqHeaders,
                'X-Forwarded-For': ip,
                'X-Forwarded-Proto': protocol,
                'X-Forwarded-Port': socket.localPort,
                'X-Forwarded-Host': hostname,
                'X-Forwarded-Path': baseUrl,
                'X-Forwarded-Method': method,
                'X-Forwarded-Url': originalUrl,

                'X-Forfarded-By': 'api-gateway',
                'X-Forwarded-Name': name,
                'X-Request-Id': id,
            },
        }
    }
}
