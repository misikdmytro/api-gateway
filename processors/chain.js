module.exports = class ChainProcessor {
    /**
     * Creates a new chain processor
     */
    constructor() {
        this.processors = []
    }

    /**
     * Adds a processor to the chain
     * @param {object} processor
     * @returns {void}
     */
    add(processor) {
        this.processors.push(processor)
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    async process() {
        const res = { result: true, response: {} }
        let context = {}

        for (const processor of this.processors) {
            const result = await processor.process(context)
            if (!result.result) {
                return result
            }

            context = { ...context, ...result.context }

            res.headers = { ...res.headers, ...result.headers }
            res.url = result.url ?? res.url
            res.body = result.body ?? res.body

            res.response.headers = { ...res.response.headers, ...result.response?.headers }
        }

        return res
    }
}
