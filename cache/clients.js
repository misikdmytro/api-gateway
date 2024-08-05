const { getClients } = require('../clients/auth')

let clients
async function refreshClients() {
    clients = await getClients()
}

setInterval(refreshClients, 1000 * 60 * 5)
refreshClients()

/**
 * Returns the clients
 * @typedef {import('../clients/auth').Client} Client
 * @returns {Client[]}
 */
exports.getClients = () => clients
