const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Category = Connection.define("categories", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    photo: DataTypes.STRING,
    sequenceNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "0.inactive 1.active"
    },
}, {
    paranoid: true,
});
