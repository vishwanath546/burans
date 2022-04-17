const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.DeliveryBoyOrders=Connection.define("DeliveryBoyOrders",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"delivery_boy_orders"
});
