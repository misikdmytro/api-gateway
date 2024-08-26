const { v4: uuidv4 } = require('uuid')
const fetch = require('node-fetch')
const service = require('../proxy')
const routes = require('../../routes/routes.json')

jest.mock('node-fetch')

describe('proxy', () => {
    describe('when no route is found', () => {
        it('should return route_not_found when no route is found', async () => {
            const req = {
                path: '/not-found',
            }

            const result = await service(req)

            expect(result).toEqual({
                response: {
                    status: 404,
                    body: {
                        error: 'route_not_found',
                        message: 'route not found',
                    },
                },
            })

            expect(fetch).not.toHaveBeenCalled()
        })

        it('should return route_not_found when the route is internal', async () => {
            const req = {
                path: '/clients',
            }

            const result = await service(req)

            expect(result).toEqual({
                response: {
                    status: 404,
                    body: {
                        error: 'route_not_found',
                        message: 'route not found',
                    },
                },
            })

            expect(fetch).not.toHaveBeenCalled()
        })
    })

    describe('when a route is found', () => {
        beforeEach(() => {
            routes.push(
                {
                    name: 'test-write-service',
                    methods: ['POST'],
                    context: ['/test'],
                    pathRewrite: {
                        '^/test': '/api',
                    },
                    target: 'https://api.write.example.com',
                    timeout: 1000,
                },
                {
                    name: 'test-read-service',
                    methods: ['HEAD', 'GET'],
                    context: ['/test'],
                    pathRewrite: {
                        '^/test': '/api',
                    },
                    target: 'https://api.read.example.com',
                    timeout: 1000,
                },
                {
                    name: 'secure-service',
                    methods: ['GET'],
                    context: ['/secure'],
                    pathRewrite: {
                        '^/secure': '/api',
                    },
                    target: 'https://api.secure.example.com',
                    timeout: 1000,
                    security: {
                        scope: 'secure',
                    },
                }
            )
        })

        afterEach(() => {
            routes.pop()
            routes.pop()
            routes.pop()
        })

        it('should proxy the request', async () => {
            const req = {
                id: uuidv4(),
                path: '/test/1',
                method: 'POST',
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

            expect(fetch).toHaveBeenCalledWith(
                'https://api.write.example.com/api/1',
                {
                    method: 'POST',
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
                        'X-Forwarded-Name': 'test-write-service',
                        'X-Request-Id': req.id,
                    },
                    body: JSON.stringify({}),
                    follow: 0,
                    timeout: 1000,
                }
            )
        })

        const getHeadMethods = ['GET', 'HEAD']
        getHeadMethods.forEach((method) => {
            it(`should not send a body for ${method} requests`, async () => {
                const req = {
                    id: uuidv4(),
                    path: '/test/1',
                    method,
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

                expect(fetch).toHaveBeenCalledWith(
                    'https://api.read.example.com/api/1',
                    {
                        method,
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
                            'X-Forwarded-Name': 'test-read-service',
                            'X-Request-Id': req.id,
                        },
                        follow: 0,
                        timeout: 1000,
                    }
                )
            })
        })

        it('should return UNATHORIZED when the token is invalid', async () => {
            const req = {
                id: uuidv4(),
                path: '/secure/1',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer invalid-token',
                },
                body: JSON.stringify({}),
                ip: '10.0.0.1',
                protocol: 'https',
                socket: {
                    localPort: 443,
                },
                hostname: 'api-gateway',
            }

            const result = await service(req)

            expect(result).toEqual({
                response: {
                    status: 401,
                    body: {
                        error: 'unauthorized',
                        message: 'missing authorization header',
                    },
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            })
        })
    })
})
