const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.OrderItems=Connection.define("OrderItems",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    quantity:DataTypes.INTEGER,
    amount:DataTypes.DOUBLE,
    saleAmount:DataTypes.DOUBLE,
    orderNotes:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:1,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"order_items"
});
