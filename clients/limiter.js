const { createClient } = require('redis')

let client

/**
 * Creates Redis client
 * @returns {Promise<import('redis').RedisClientType>}
 */
exports.getRedisClient = async () => {
    if (client) {
        return client
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    client = createClient(redisUrl)
    await client.connect()

    return client
}
