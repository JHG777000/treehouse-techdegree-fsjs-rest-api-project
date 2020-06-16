const express = require('express');
const routes = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
const models = require('../models').models;

const findUser = async (email) => {
  try {
    const user = await models.User.findAll({
      where: {
        emailAddress: email,
      },
    });
    return user;
  } catch (err) {
    return null;
  }
};

const authenticateUser = async (req, res, next) => {
  let message = null;
  let user;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store
    // by their username (i.e. the user's "key"
    // from the Authorization header).
    user = await findUser(credentials.name);
    user = user[0];
    // If a user was successfully retrieved from the data store...
    if (user) {
      // Use the bcryptjs npm package to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the data store.
      let authenticated;
      try {
        authenticated = bcrypt.compareSync(credentials.pass, user.password);
      } catch (err) {
        message = err.message;
      }

      // If the passwords match...
      if (authenticated) {
        req.currentUser = user;
        console.log(
          `Authentication successful for username: ${user.firstName}`
        );

        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.firstName}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If user authentication failed...
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};


routes.get('/api/the_users', async (req, res) => {
  const users = await models.User.findAll({});
  res.json({ users });
  res.status(200);
});

routes.get('/api/users', authenticateUser, (req, res) => {
  res.json(req.currentUser);
  res.status(200);
});

routes.post('/api/users', async (req, res) => {
  let pswd = req.body.password;
  let salt = bcrypt.genSaltSync(10);
  if (pswd === undefined) {
    res.status(400).json({ message: 'Bad password!' });
  } else {
    req.body.password = bcrypt.hashSync(pswd, salt);
    console.log(req.body);
    try {
      const user = await models.User.create(req.body);
      res.location('/');
      res.status(201).end();
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: err.message });
      }
    }
  }
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

routes.post('/api/courses', authenticateUser, async (req, res) => {
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

routes.put('/api/courses/:id', authenticateUser, async (req, res) => {
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

routes.delete('/api/courses/:id', authenticateUser, async (req, res) => {
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
