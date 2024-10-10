const clients = require('./clients.json');
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();

app.use(multer().none());

app.get('/clients', (_, res) => {
    res.json(clients);
});

app.post('/oauth2/token', (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).json({ error: 'invalid_client' });
        return;
    }

    if (!req.body) {
        res.status(400).json({ error: 'invalid_request' });
        return;
    }

    if (req.headers.authorization.split(' ')[0] !== 'Basic') {
        res.status(401).json({ error: 'invalid_client' });
        return;
    }

    // read creds from authorization header
    const [client_id, client_secret] = Buffer.from(
        req.headers.authorization.split(' ')[1],
        'base64'
    )
        .toString()
        .split(':');

    // find client
    const client = clients.find((client) => client.client_id === client_id);

    // check client secret
    if (client?.client_secret !== client_secret) {
        res.status(401).json({ error: 'invalid_client' });
        return;
    }
    // check grant type
    if (req.body.grant_type !== 'client_credentials') {
        res.status(400).json({ error: 'unsupported_grant_type' });
        return;
    }

    if (!client.grant_types.includes(req.body.grant_type)) {
        res.status(400).json({ error: 'unauthorized_client' });
        return;
    }

    // check scopes
    if (!req.body.scope) {
        res.status(400).json({ error: 'invalid_scope' });
        return;
    }

    if (
        req.body.scope
            .split(' ')
            .some((scope) => !client.scopes.includes(scope))
    ) {
        res.status(400).json({ error: 'invalid_scope' });
        return;
    }

    // generate JWT
    const {
        signing_alg,
        jwks: { k },
        exp,
    } = client;

    const now = Math.floor(Date.now() / 1000);

    const token = jwt.sign(
        {
            client_name: client.client_name,
            client_id,
            scope: req.body.scope.split(' '),
            iat: now,
            nbf: now,
            exp: now + exp,
            iss: 'urn:auth',
        },
        Buffer.from(k, 'base64').toString(),
        {
            algorithm: signing_alg,
        }
    );

    res.json({ access_token: token, token_type: 'Bearer', expires_in: exp });
});

app.listen(3002, () => {
    console.log('Server is running on http://localhost:3002');
});
