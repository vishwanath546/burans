const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Orders=Connection.define("Orders",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    amount:DataTypes.DOUBLE,
    discountAmount:DataTypes.DOUBLE,
    offerAmount:DataTypes.DOUBLE,
    orderNotes:DataTypes.STRING,
    pin:DataTypes.INTEGER,
    paymentMethod:{
        type:DataTypes.INTEGER,
        comment: "1.cash 2.online"
    },
    preparationTime:DataTypes.TIME,
    extraTime:DataTypes.TIME,
    status:{
        type:DataTypes.INTEGER,
        comment:"0.Pending 1.confirm by delivery body  2.Preparation 3.cancel by client" +
            " 4.cancel by vendor 5.Pickup 6.Deliver"
    },
});
