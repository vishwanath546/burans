const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.VendorOrders=Connection.define("VendorOrders",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    penaltyAmount:DataTypes.DOUBLE,
    reason:{
        type:DataTypes.INTEGER,
        comment:"1.Cancel by Vendor 2.extra time"
    },
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"vendor_orders"
});
