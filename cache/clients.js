const { getClients } = require('../clients/auth')

let clients
async function refreshClients() {
    clients = await getClients()
}

exports.launch = async () => {
    const refreshInterval =
        process.env.CLIENTS_REFRESH_INTERVAL || 1000 * 60 * 5

    await refreshClients()
    setInterval(refreshClients, refreshInterval)
}

/**
 * Returns the clients
 * @typedef {import('../clients/auth').Client} Client
 * @returns {Client[]}
 */
exports.getClients = () => clients
