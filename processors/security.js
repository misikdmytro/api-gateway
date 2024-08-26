const { getClients } = require('../cache/clients')
const { jwtDecode } = require('jwt-decode')
const jwt = require('jsonwebtoken')

module.exports = class SecurityProcessor {
    /**
     * Creates a new security handler
     * @typedef {import('./types').Route} Route
     * @param {Route} route
     * @param {import('express').Request} req
     */
    constructor(route, req) {
        this.__route = route
        this.__req = req
        this.__clients = getClients()
    }

    /**
     * Processes the request
     * @typedef {import('./types').Result} Result
     * @returns {Result}
     */
    process() {
        const { scope } = this.__route.security
        const { authorization } = this.__req.headers

        // get bearer token
        if (!authorization) {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'missing authorization header',
                    },
                }
            }
        }

        const [bearer, token] = authorization.split(' ')
        if (bearer !== 'Bearer') {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid authorization header',
                    }
                }
            }
        }

        // decode token to get client_id claim
        let decoded
        try {
            decoded = jwtDecode(token)
        } catch {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid token',
                    }
                }
            }
        }

        // get client
        const client = this.__clients.find(
            (client) => client.client_id === decoded.client_id
        )
        if (!client) {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'client not found',
                    }
                }
            }
        }

        // verify token
        let claims
        try {
            const signingKey = Buffer.from(client.jwks.k, 'base64').toString()
            claims = jwt.verify(token, signingKey)
        } catch {
            return {
                result: false,
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid token',
                    }
                }
            }
        }

        // verify scope
        if (!claims.scope.includes(scope)) {
            return {
                result: false,
                response: {
                    status: 403,
                    body: {
                        error: 'forbidden',
                        message: 'insufficient scope',
                    }
                }
            }
        }

        const headers = {
            'X-Client-Id': client.client_id,
            'X-Client-Name': client.client_name,
        }

        return { result: true, headers, context: { client } }
    }
}