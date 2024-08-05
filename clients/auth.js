const fetch = require('node-fetch')
const routes = require('../routes/routes.json')

const authRoute = routes.find((route) => route.name === 'auth-clients-service')

/**
 * @typedef {Object} Client
 * @property {string} client_name
 * @property {string} client_id
 * @property {string} client_secret
 * @property {string[]} scopes
 * @property {string[]} grant_types
 * @property {string[]} redirect_uris
 * @property {string} signing_alg
 * @property {Object} jwks
 * @property {string} jwks.k
 * @property {number} exp
 */

/**
 * Fetches the clients from the auth service
 * @typedef {import('node-fetch').Response} Response
 * @typedef {Client[]} Clients
 * @returns {Promise<Clients>}
 */
exports.getClients = async () => {
    const url = `${authRoute.target}/clients`
    const response = await fetch(url)
    return response.json()
}
