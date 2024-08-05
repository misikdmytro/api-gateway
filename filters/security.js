const { getClients } = require('../cache/clients')
const { jwtDecode } = require('jwt-decode')
const jwt = require('jsonwebtoken')

const errors = {
    UNATHORIZED: 'UNATHORIZED',
    FORBIDDEN: 'FORBIDDEN',
}

class SecurityHandler {
    /**
     * Creates a new security handler
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     */
    constructor(route) {
        this.route = route
    }

    /**
     * Processes the request
     * @typedef {import('./types').Context} Context
     * @typedef {import('./types').Result} Result
     * @param {Context} context
     * @returns {Result}
     */
    process(context) {
        const { scope } = this.route.security
        const { authorization } = context

        const clients = getClients()

        // get bearer token
        if (!authorization) {
            return {
                error: errors.UNATHORIZED,
                message: 'unauthorized',
                result: false,
            }
        }

        const [bearer, token] = authorization.split(' ')
        if (bearer !== 'Bearer') {
            return {
                error: errors.UNATHORIZED,
                message: 'unauthorized',
                result: false,
            }
        }

        // decode token to get client_id claim
        let decoded
        try {
            decoded = jwtDecode(token)
        } catch {
            return {
                error: errors.UNATHORIZED,
                message: 'invalid token',
                result: false,
            }
        }

        // get client
        const client = clients.find(
            (client) => client.client_id === decoded.client_id
        )
        if (!client) {
            return {
                error: errors.UNATHORIZED,
                message: 'client not found',
                result: false,
            }
        }

        // verify token
        let claims
        try {
            const signingKey = Buffer.from(client.jwks.k, 'base64').toString()
            claims = jwt.verify(token, signingKey)
        } catch {
            return {
                error: errors.UNATHORIZED,
                message: 'invalid token',
                result: false,
            }
        }

        // verify scope
        if (!claims.scope.includes(scope)) {
            return {
                error: errors.FORBIDDEN,
                message: 'insufficient scope',
                result: false,
            }
        }

        return { result: true }
    }
}

module.exports = SecurityHandler
module.exports.errors = errors
