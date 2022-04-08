const {DataTypes} = require('sequelize');
const {Connection} = require('./Database');
const {Products} = require('./Products');
const {Category} = require('./Category');
module.exports.SuggestedProductCategory=Connection.define("SuggestedProductCategory",{
    CategoryId:{
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    },
    SuggestedProductId:{
        type: DataTypes.INTEGER,
        references: {
            model: Products,
            key: 'id'
        }
    }
},{
    tableName:"suggested_product_category_mapping"
});
