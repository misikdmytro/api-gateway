module.exports = class ChainFilter {
    /**
     * Creates a new chain filter
     */
    constructor() {
        this.filters = []
    }

    /**
     * Adds a filter to the chain
     * @param {object} filter
     * @returns {void}
     */
    add(filter) {
        this.filters.push(filter)
    }

    /**
     * Processes the request
     * @typedef {import('./types').Context} Context
     * @typedef {import('./types').Result} Result
     * @param {Context} context
     * @returns {Result}
     */
    process(context) {
        for (const filter of this.filters) {
            const result = filter.process(context)
            if (!result.result) {
                return result
            }
        }

        return { result: true }
    }
}
