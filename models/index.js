const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.User = require('./user.js')(sequelize);
db.models.Course = require('./course.js')(sequelize);

db.models.User.hasMany(db.models.Course);
db.models.Course.belongsTo(db.models.User);

module.exports = db;
