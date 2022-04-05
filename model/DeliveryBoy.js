const {DataTypes} = require('sequelize');

const {Connection} = require('./Database');

module.exports.DeliveryBoy = Connection.define('DeliveryBoy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    email:DataTypes.STRING,
    mobileNumber:DataTypes.STRING,
    area:DataTypes.STRING,
    license: DataTypes.STRING,
    licensePhoto:DataTypes.STRING,
    bikeRc:DataTypes.STRING,
    bikeRcPhoto:DataTypes.STRING,
    photo:DataTypes.STRING,
    loginAt: DataTypes.DATE,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    }
},{
    tableName:"delivery_boy"
});
