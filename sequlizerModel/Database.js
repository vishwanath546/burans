const Sequelize = require('sequelize');
module.exports.Connection = new Sequelize('burans', 'root', '', {
    dialect: "mysql",
    host: "localhost",
    logging: true
});
module.exports.Sequelize = Sequelize;

