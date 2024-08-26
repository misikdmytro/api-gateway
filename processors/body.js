module.exports = class BodyProcessor {
    /**
     * Creates a new body processor
     * @param {import('express').Request} req
     */
    constructor(req) {
        this.__req = req
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    process() {
        const { body, method } = this.__req
        if (method === 'GET' || method === 'HEAD') {
            return {}
        }

        return { context: { body } }
    }
}
