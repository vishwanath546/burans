const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
const {AddOnsProduct} = require('./AddOnsProduct');
const {Products} = require('./Products');
module.exports.AddOnProductMapping=Connection.define("AddOnProductMapping",{
    AddOnId:{
        type: DataTypes.INTEGER,
        references: {
            model: AddOnsProduct,
            key: 'id'
        }
    },
    ProductId:{
        type: DataTypes.INTEGER,
        references: {
            model: Products,
            key: 'id'
        }
    }
},{
    tableName:"addon_product_mapping"
});
