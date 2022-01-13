const Sequelize = require('sequelize');
module.exports.Connection = new Sequelize('burans', 'root', '', {
    dialect: "mysql",
    host: "localhost",
});
module.exports.Sequelize = Sequelize;

