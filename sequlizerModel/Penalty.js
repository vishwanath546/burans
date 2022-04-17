const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Penalty=Connection.define("penalty",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    amount:DataTypes.DOUBLE,
    reason:{
        type:DataTypes.INTEGER,
        comment:"1.Cancel by Vendor 2.extra time"
    },
    status:DataTypes.INTEGER
})
