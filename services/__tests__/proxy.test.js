const fetch = require('node-fetch')
const service = require('../proxy.js')
const routes = require('../../routes/routes.json')

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

    describe('when a route is found', () => {
        beforeEach(() => {
            routes.push({
                name: "test-service",
                context: ['/test'],
                pathRewrite: {
                    '^/test': '/api',
                },
                target: 'https://api.example.com',
                timeout: 1000,
            })
        })

        afterEach(() => {
            routes.pop()
        })

        it('should proxy the request', async () => {
            routes.push({
                name: "test-service",
                context: ['/test'],
                pathRewrite: {
                    '^/test': '/api',
                },
                target: 'https://api.example.com',
                timeout: 1000,
            })

            const req = {
                path: '/test/1',
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

            expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/1', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Forwarded-For': req.ip,
                    'X-Forwarded-Proto': req.protocol,
                    'X-Forwarded-Port': req.socket.localPort,
                    'X-Forwarded-Host': req.hostname,
                    'X-Forwarded-Path': req.baseUrl,
                    'X-Forwarded-Method': req.method,
                    'X-Forwarded-Url': req.originalUrl,
                    'X-Forfarded-By': 'api-gateway',
                },
                body: JSON.stringify({}),
                follow: false,
                timeout: 1000,
            })
        })
    })
})
