const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.UserAddress=Connection.define("UserAddress",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    addressLineOne:DataTypes.STRING,
    addressLineTwo:DataTypes.STRING,
    city:DataTypes.STRING,
    pinCode:DataTypes.STRING,
    longitude:DataTypes.DOUBLE,
    latitude:DataTypes.DOUBLE,
    contactNumber:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"user_address"
});
