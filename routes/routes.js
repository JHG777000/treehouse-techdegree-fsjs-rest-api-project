const express = require('express');
const routes = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
const models = require('../models').models;

//the findUser function, uses the user name(user email)
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
  let message;
  let user;
  //get the credentials from  auth header
  const credentials = auth(req);
  //if credentials are valid
  if (credentials) {
    //find user via the findUser function, uses the user name(user email)
    user = await findUser(credentials.name);
    user = user[0];
    //if found user
    if (user) {
      //use bcrypt to validate password
      let authenticated;
      try {
        authenticated = bcrypt.compareSync(credentials.pass, user.password);
      } catch (err) {
        message = err.message;
      }
      //if authenticated
      if (authenticated) {
        req.currentUser = user;
        console.log(
          `Authentication successful for username: ${user.firstName}`
        );
        //set the currentUser
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

  //if authentication failed
  if (message) {
    console.warn(message);
    //return a 401 HTTP status code
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};

routes.get('/api/the_users', async (req, res) => {
  const users = await models.User.findAll({});
  res.json({ users });
  res.status(200);
});

routes.get('/api/users', authenticateUser, (req, res) => {
  res.json({
    id: req.currentUser.id,
    firstName: req.currentUser.firstName,
    lastName: req.currentUser.lastName,
    emailAddress: req.currentUser.emailAddress,
  });
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

const sendCourses = (courses) => {
  let ret_courses = [];
  let i = 0;

  while (i < courses.length) {
    ret_courses.push({
      id: courses[i].id,
      userId: courses[i].userId,
      title: courses[i].title,
      description: courses[i].description,
      materialsNeeded: courses[i].materialsNeeded,
    });
    i++;
  }
  return ret_courses;
};

routes.get('/api/courses', async (req, res) => {
  const courses = await models.Course.findAll({});
  res.json(sendCourses(courses));
  res.status(200);
});

routes.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    res.json({
      id: course.id,
      userId: course.userId,
      title: course.title,
      description: course.description,
      materialsNeeded: course.materialsNeeded,
    });
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
    if (course.userId === req.currentUser.id) {
      try {
        await course.update(req.body);
        res.status(204).end();
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    } else {
      res.status(403).json({ message: 'User does not own course.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

routes.delete('/api/courses/:id', authenticateUser, async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id);
    if (course.userId === req.currentUser.id) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: 'User does not own course.' });
    }
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
