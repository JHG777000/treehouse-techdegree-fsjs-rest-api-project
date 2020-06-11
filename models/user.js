'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init(
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      emailAddress: Sequelize.STRING,
      password: Sequelize.STRING,
    },
    { sequelize }
  );

  return User;
};
