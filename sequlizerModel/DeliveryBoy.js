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
    address:DataTypes.STRING,
    license: DataTypes.STRING,
    licensePhoto:DataTypes.STRING,
    bikeRc:DataTypes.STRING,
    bikeRcPhoto:DataTypes.STRING,
    avatar:DataTypes.STRING,
    loginAt: DataTypes.DATE,
    // accountStatus: {
    //     type: DataTypes.INTEGER,
    //     default:1,
    //     comment: "1:active 2:inactive 3:confirm 4:not confirm",
    // },
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    }
},{
    tableName:"delivery_boy"
});
