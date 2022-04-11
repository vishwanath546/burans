const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
const {AddOnsProduct} = require('./AddOnsProduct');
const {Products} = require('./Products');
module.exports.AddOnProductMapping=Connection.define("AddOnProductMapping",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

},{
    tableName:"addon_product_mapping"
});
