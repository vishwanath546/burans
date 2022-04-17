const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Users=Connection.define("User",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    email:DataTypes.STRING,
    mobileNumber:DataTypes.STRING,
    gender:{
        type:DataTypes.INTEGER,
        defaultValue: 1,
        comment: "1.Male,2.Female"
    },
    avatar:DataTypes.STRING,
    verified:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.pending,1.verified"
    },
    emailVerifiedAt:DataTypes.DATE,
    settings:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
},{
    paranoid: true,
});
