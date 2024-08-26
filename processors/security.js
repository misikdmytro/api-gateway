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
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'missing authorization header',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        const [bearer, token] = authorization.split(' ')
        if (bearer !== 'Bearer') {
            return {
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid authorization header',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // decode token to get client_id claim
        let decoded
        try {
            decoded = jwtDecode(token)
        } catch {
            return {
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid token',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // get client
        const client = this.__clients.find(
            (client) => client.client_id === decoded.client_id
        )
        if (!client) {
            return {
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'client not found',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // verify token
        let claims
        try {
            const signingKey = Buffer.from(client.jwks.k, 'base64').toString()
            claims = jwt.verify(token, signingKey)
        } catch {
            return {
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'invalid token',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        // verify scope
        if (!claims.scope.includes(scope)) {
            return {
                response: {
                    status: 403,
                    body: {
                        error: 'forbidden',
                        message: 'insufficient scope',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            }
        }

        const headers = {
            'X-Client-Id': client.client_id,
            'X-Client-Name': client.client_name,
        }

        return { context: { client, headers } }
    }
}
