/**
 * @typedef {Result}
 * @property {boolean} result
 * @property {object} headers
 * @property {string} url
 * @property {object} body
 * @property {object} context
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