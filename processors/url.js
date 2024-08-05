module.exports = class UrlProcessor {
    constructor(route, req) {
        this.__route = route
        this.__req = req
    }

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
