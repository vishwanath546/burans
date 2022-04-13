const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
module.exports.SubServiceMapping=Connection.define("SubServiceMapping",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
},{
    tableName:"sub_service_mapping"
});
