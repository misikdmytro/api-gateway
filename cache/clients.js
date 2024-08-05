const { getClients } = require('../clients/auth')

let clients
async function refreshClients() {
    clients = await getClients()
}

const refreshInterval = process.env.CLIENTS_REFRESH_INTERVAL || 1000 * 60 * 5
setInterval(refreshClients, refreshInterval)
refreshClients()

/**
 * Returns the clients
 * @typedef {import('../clients/auth').Client} Client
 * @returns {Client[]}
 */
exports.getClients = () => clients
