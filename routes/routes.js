const express = require('express');
const routes = express.Router();
const models = require('../models').models;

routes.get('/api/users', (req, res) => {
  res.status(200);
});

routes.post('/api/users', (req, res) => {
  res.location('/');
  res.status(201);
});

routes.get('/api/courses', (req, res) => {
  res.status(200);
});

routes.get('/api/courses/:id', (req, res) => {
  res.status(200);
});

routes.post('/api/courses', (req, res) => {
  res.status(201);
});

routes.put('/api/courses/:id', (req, res) => {
  res.status(204);
});

routes.delete('/api/courses/:id', (req, res) => {
  res.status(204);
});

// setup a friendly greeting for the root route
routes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

module.exports = routes;
