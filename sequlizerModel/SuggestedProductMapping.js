const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
module.exports.SuggestedProductCategory=Connection.define("SuggestedProductCategory",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
},{
    tableName:"suggested_item_mapping"
});
