const { createClient } = require('redis')
const logger = require('../logger')

let client

/**
 * Creates Redis client
 * @returns {Promise<import('redis').RedisClientType>}
 */
exports.getRedisClient = async () => {
    if (client) {
        return client
    }

    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
        client = createClient({ url: redisUrl })
        await client.connect()

        return client
    } catch (err) {
        logger.error('Error occurred while connecting to Redis', err)
        client = undefined
    }
}
