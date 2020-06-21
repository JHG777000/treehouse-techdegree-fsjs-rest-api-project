'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init(
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: {
            msg: '"title" is required',
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        validate: {
          notEmpty: {
            msg: '"description" is required',
          },
        },
      },
      estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    { sequelize }
  );

  return Course;
};
