const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.AdminUser=Connection.define("AdminUser",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    email:DataTypes.STRING,
    mobileNumber:DataTypes.STRING,
    avatar:DataTypes.STRING,
    settings:DataTypes.STRING,
    updateBy:DataTypes.INTEGER,
    createBy:DataTypes.INTEGER,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:1,
        comment:"0.inactive 1.active"
    },
},{
    tableName:"admin_user",
    paranoid: true,
});
