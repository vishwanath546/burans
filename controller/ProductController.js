const {Connection} = require('../model/Database');
const {Op} = require('sequelize');
const {Product} = require('../model/Products');
const {ProductImages} = require('../model/ProductImages');

const {clearImage} = require('../util/helpers');


exports.saveCategorySubcategory = (request, response, next) => {

    let {product_name, product_description,category,subcategory,
        status, price,sale_price,price_quantity,special_delivery_charges,
        product_meta_title,product_meta_description,
        product_id} = request.body;

    Connection.transaction(async (trans) => {
        return Product.findByPk(product_id).then(async product => {
            let ProductObject = {
                name: product_name,
                description: product_description,
                categoryId:category,
                subCategoryId:subcategory,
                price: price,
                salePrice: sale_price,
                priceQuantity:price_quantity,
                specialDeliveryCharges:special_delivery_charges,
                metaTitle:product_meta_title,
                metaDescription:product_meta_description,
                status:status
            };
            await Product.create(ProductObject, {transaction: trans});

            Product.update()

        })

    }).then(() => {
        response.status(200).json({
            body: "Create Category Successfully"
        })
    }).catch(error => {
        next(error)
    })
}
