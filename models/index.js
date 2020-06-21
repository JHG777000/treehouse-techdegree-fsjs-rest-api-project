const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
});

const logConnection = async (e) => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.User = require('./user.js')(sequelize);
db.models.Course = require('./course.js')(sequelize);

db.models.User.hasMany(db.models.Course, { foreignKey: 'userId' });
db.models.Course.belongsTo(db.models.User);

logConnection();

module.exports = db;
