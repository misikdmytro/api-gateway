/**
 * @typedef {Result}
 * @property {object} context
 * @property {string} context.url
 * @property {string} context.method
 * @property {string} context.body
 * @property {object} context.headers
 * @property {object} response
 * @property {number} response.status
 * @property {object} response.body
 * @property {object} response.headers
 */

/**
 * @typedef {Limit}
 * @property {number} rate
 * @property {number} window
 */

/**
 * @typedef {Route}
 * @property {object} security
 * @property {string} security.scope
 * @property {Record<string, Limit>} limits
 */

module.exports = {}
