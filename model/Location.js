const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Location = Connection.define("Location", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: DataTypes.STRING,
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "0.inactive 1.active"
    },
}, {
    tableName:'location',
    paranoid: true,
});
