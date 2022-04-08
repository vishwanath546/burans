const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.AddOnsProduct=Connection.define("AddOnsProduct",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    description:DataTypes.STRING,
    price:DataTypes.DOUBLE,
    photo:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"addons_products",
    paranoid: true,
});
