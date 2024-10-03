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
        let context = {}

        for (const processor of this.processors) {
            const result = await processor.process(context)
            if (result.response) {
                for (const postProcessor of this.processors) {
                    if (postProcessor.postProcess) {
                        await postProcessor.postProcess(result.response)
                    }
                }

                return { response: result.response }
            }

            context = {
                ...context,
                ...result.context,
                headers: { ...context.headers, ...result.context?.headers },
            }
        }

        return { response: { status: 500 } }
    }
}
