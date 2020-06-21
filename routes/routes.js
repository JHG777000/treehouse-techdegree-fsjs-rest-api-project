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
  let salt = bcrypt.genSaltSync(10);
  if (req.body.password !== undefined) {
    req.body.password = bcrypt.hashSync(req.body.password, salt);
  }
  try {
    const user = await models.User.create({
      firstName: req.body.firstName === undefined ? '' : req.body.firstName,
      lastName: req.body.lastName === undefined ? '' : req.body.lastName,
      emailAddress:
        req.body.emailAddress === undefined ? '' : req.body.emailAddress,
      password: req.body.password === undefined ? '' : req.body.password,
    });
    res.location('/');
    res.status(201).end();
  } catch (err) {
    if (
      err.name === 'SequelizeValidationError' ||
      err.name == 'SequelizeUniqueConstraintError'
    ) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message });
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
      User: courses[i].User,
      title: courses[i].title,
      description: courses[i].description,
      materialsNeeded: courses[i].materialsNeeded,
    });
    i++;
  }
  return ret_courses;
};

routes.get('/api/courses', async (req, res) => {
  const courses = await models.Course.findAll({
    include: [
      {
        model: models.User,
      },
    ],
  });
  res.json(sendCourses(courses));
  res.status(200);
});

routes.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await models.Course.findByPk(req.params.id, {
      include: [
        {
          model: models.User,
        },
      ],
    });
    res.json({
      id: course.id,
      userId: course.userId,
      User: course.User,
      title: course.title,
      description: course.description,
      materialsNeeded: course.materialsNeeded,
    });
    res.status(200);
  } catch (err) {
    res.status(400).json({ message: 'Could not find course.' });
  }
});

routes.post('/api/courses', authenticateUser, async (req, res) => {
  try {
    const course = await models.Course.create({
      userId:
        req.body.userId === undefined ? req.currentUser.id : req.body.userId,
      title: req.body.title === undefined ? '' : req.body.title,
      description:
        req.body.description === undefined ? '' : req.body.description,
      materialsNeeded:
        req.body.materialsNeeded === undefined ? '' : req.body.materialsNeeded,
    });
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
        await course.update({
          userId: req.body.userId,
          title: req.body.title === undefined ? '' : req.body.title,
          description:
            req.body.description === undefined ? '' : req.body.description,
          materialsNeeded:
            req.body.materialsNeeded === undefined
              ? ''
              : req.body.materialsNeeded,
        });
        res.status(204).end();
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.status(403).json({ message: 'User does not own course.' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Could not find course.' });
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
    res.status(400).json({ message: 'Could not find course.' });
  }
});

// setup a friendly greeting for the root route
routes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

module.exports = routes;
