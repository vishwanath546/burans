const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.ProductImages=Connection.define("ProductImages",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    path:DataTypes.STRING,
    sequenceNumber :{
        type:DataTypes.INTEGER,
        defaultValue: 0
    },
},{
    tableName:"product_images"
});
