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

routes.get('/api/courses', async (req, res) => {
  const courses = await models.Course.findAll({});
  res.json({ courses });
  res.status(200);
});

routes.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    res.json({ course });
    res.status(200);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

routes.post('/api/courses', async (req, res) => {
  try {
    const course = await models.Course.create(req.body);
    res.location('/api/courses/' + course.id);
    res.status(201).end();
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

routes.put('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    try {
      await course.update(req.body);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

routes.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// setup a friendly greeting for the root route
routes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

module.exports = routes;
