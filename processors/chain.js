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
    process() {
        const res = { result: true }

        for (const processor of this.processors) {
            const result = processor.process()
            if (!result.result) {
                return result
            }

            res.headers = { ...res.headers, ...result.headers }
            res.url = result.url ?? res.url
            res.body = result.body ?? res.body
        }

        return res
    }
}
