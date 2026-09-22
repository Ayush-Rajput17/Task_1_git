const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'my-simple-secret-key';

// Users only live while the server is running.
const users = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/api/register', function (req, res) {
  const name = req.body.name;
  const password = req.body.password;

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required.' });
  }

  const existingUser = users.find(function (item) {
    return item.name === name;
  });

  if (existingUser) {
    return res.status(409).json({ message: 'That name is already registered.' });
  }

  users.push({ name: name, password: password });

  res.json({
    message: 'Registration successful. You can now log in.'
  });
});

app.post('/api/login', function (req, res) {
  const name = req.body.name;
  const password = req.body.password;

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required.' });
  }

  const user = users.find(function (item) {
    return item.name === name;
  });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Name or password is incorrect.' });
  }

  const token = jwt.sign({ name: user.name }, SECRET_KEY, { expiresIn: '1h' });

  res.json({
    message: 'Login successful!',
    token: token
  });
});

app.get('/api/profile', function (req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

app.listen(PORT, function () {
  console.log('Server running at http://localhost:' + PORT);
});
