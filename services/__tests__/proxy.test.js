const fetch = require('node-fetch')
const service = require('../proxy.js') // Adjust the path as necessary

jest.mock('node-fetch')

describe('proxy', () => {
    it('should return ROUTE_NOT_FOUND when no route is found', async () => {
        const req = {
            path: '/not-found',
        }

        const result = await service(req)

        expect(result).toEqual({
            error: 'ROUTE_NOT_FOUND',
            message: 'route not found',
        })

        expect(fetch).not.toHaveBeenCalled()
    })

    it('should proxy the request', async () => {
        const req = {
            path: '/users/1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            ip: '10.0.0.1',
            protocol: 'https',
            socket: {
                localPort: 443,
            },
            hostname: 'api-gateway',
        }

        const response = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }

        fetch.mockResolvedValue(response)

        const result = await service(req)

        expect(result).toEqual({
            response,
        })
    })
})
