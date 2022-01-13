const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Products=Connection.define("products",{
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
    detail:DataTypes.STRING,
    photo:DataTypes.STRING,
    priceQuantity:DataTypes.DOUBLE,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
});
