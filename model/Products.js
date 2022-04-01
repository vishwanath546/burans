const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Products=Connection.define("Products",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    price:DataTypes.DOUBLE,
    salePrice:DataTypes.DOUBLE,
    description:DataTypes.STRING,
    priceQuantity:DataTypes.STRING,
    specialDeliveryCharges:DataTypes.STRING,
    metaTitle:DataTypes.STRING,
    metaDescription:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
});
