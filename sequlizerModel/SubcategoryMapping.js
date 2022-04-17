const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
module.exports.SubcategoryMapping=Connection.define("SubcategoryMapping",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
},{
    tableName:"subcategory_mapping"
});
