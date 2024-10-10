const express = require('express');

const app = express();

const users = [];

app.use(express.json());

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const user = users.find((user) => user.id === id);
    res.json(user);
});

app.post('/users', (req, res) => {
    const user = req.body;
    users.push(user);
    res.json(user);
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
