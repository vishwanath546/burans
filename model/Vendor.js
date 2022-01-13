const {DataTypes} = require('sequelize');

const {Connection} = require('./Database');

module.exports.Vendor = Connection.define('Vendor', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: DataTypes.STRING,
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    shopName: DataTypes.STRING,
    gstNumber: DataTypes.STRING,
    foodLicense: DataTypes.STRING,
    area: DataTypes.STRING,
    accountStatus: {
        type: DataTypes.INTEGER,
        comment: "1:active 2:inactive 3:confirm 4:not confirm"
    },
    updateOnColumn: DataTypes.STRING,
    adminConfirmOn: {
        type: DataTypes.INTEGER,
        comment: "1:confirm 0:not confirm"
    },
    loginAt: DataTypes.DATE
});