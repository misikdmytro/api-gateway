module.exports = class UrlProcessor {
    /**
     * Creates a new url processor
     * @param {object} route
     * @param {import('express').Request} req
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
        const { path } = this.__req
        const { target, pathRewrite } = this.__route

        const servicePath = Object.entries(pathRewrite).reduce(
            (acc, [key, value]) => acc.replace(new RegExp(key), value),
            path
        )

        return {
            result: true,
            url: `${target}${servicePath}`,
        }
    }
}
