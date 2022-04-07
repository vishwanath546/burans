const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');

module.exports.Products=Connection.define("Products",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name:DataTypes.STRING,
    price:DataTypes.DOUBLE,
    salePrice:DataTypes.DOUBLE,
    description:DataTypes.STRING,
    priceQuantity:DataTypes.STRING,
    specialDeliveryCharges:DataTypes.STRING,
    stockQuantity:{
        type:DataTypes.INTEGER,
        comment:"number of units in stock"
    },
    stockType:{
      type:DataTypes.INTEGER,
      defaultValue:1,
      comment:"1.daily 2.onetime"
    },
    minStock:{
        type:DataTypes.INTEGER,
        comment:"warning limit to vendor"
    },
    makingDuration:{
      type:DataTypes.INTEGER,
      comment:"making time for vendor"
    },
    metaTitle:DataTypes.STRING,
    metaDescription:DataTypes.STRING,
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0,
        comment:"0.inactive 1.active"
    },
});
