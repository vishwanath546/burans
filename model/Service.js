const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Service = Connection.define("Service", {
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
    isSubService:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0 service 1 subService"
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "0.inactive 1.active"
    },
}, {
    tableName:'service',
    paranoid: true,
});
