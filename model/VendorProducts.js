const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.VendorProduct=Connection.define("VendorProduct",{
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
    tableName:"vendor_product"
});
