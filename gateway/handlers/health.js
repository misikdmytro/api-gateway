/**
 * Health check handler
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @param {Request} _
 * @param {Response} res
 * @returns {void}
 */
module.exports = (_, res) => {
    res.status(200).json({ status: 'Healthy' })
}
