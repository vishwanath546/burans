const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.CouponCode=Connection.define("CouponCode",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    description:DataTypes.STRING,
    code:DataTypes.STRING,
    expirationType:{
        type: DataTypes.INTEGER,
        comment:"1.Number of Days 2.No of Usages"
    },
    expiration:DataTypes.INTEGER,
    discountPercentage:DataTypes.DOUBLE,
    status:{
        type:DataTypes.INTEGER,
        comment:"0.inactive 1.inactive 2.expiry"
    },
},{
    tableName:"coupon_code"
});
