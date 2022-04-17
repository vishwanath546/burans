const {DataTypes} = require('sequelize');
const {AdminUser} =require('./AdminUser');
const {Connection} = require('./Database');

module.exports.UserAuth = Connection.define('UserAuth', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userType:{
        type:DataTypes.INTEGER,
        comment:"1.Customer 2.Vendor 3.Delivery Boy 4.Admin"
    },
    mobileNumber:DataTypes.STRING,
    password:DataTypes.STRING,
    otpToken:DataTypes.STRING,
    rememberToken:DataTypes.STRING,
    loginAt: DataTypes.DATE,
    AdminUserId:{
        type: DataTypes.INTEGER,
        references: {
            model: AdminUser, // 'Movies' would also work
            key: 'id'
        }
    }
},{
    tableName:"user_auth"
});
