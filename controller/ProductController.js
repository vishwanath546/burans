const {Connection} = require('../sequlizerModel/Database');
const {Op} = require('sequelize');
const {Products} = require('../sequlizerModel/Products');
const {ProductImages} = require('../sequlizerModel/ProductImages');
const {Category} = require('../sequlizerModel/Category');
const tableName="";
const {clearImage} = require('../util/helpers');


exports.saveProductDetails = (request, response, next) => {

    let {
        product_name, product_description, category, subcategory,
        status, price, sale_price, price_quantity, special_delivery_charges,
        product_meta_title, product_meta_description,
        product_id
    } = request.body;

    Connection.transaction(async (trans) => {
        return Products.findByPk(product_id).then(async product => {
            let ProductObject = {
                name: product_name,
                description: product_description,
                categoryId:category,
                subCategoryId: subcategory,
                price: price,
                salePrice: sale_price,
                priceQuantity: price_quantity,
                specialDeliveryCharges: special_delivery_charges,
                metaTitle: product_meta_title,
                metaDescription: product_meta_description,
                status: status,

            };
            if (!product) {
                return Products.create(ProductObject, {transaction: trans});
            } else {
                return await Products.update(ProductObject, {where: {id: product_id}})
            }
        }).catch(error => {
            next(error);
        });
    }).then(product => {
        if (product) {
            response.status(200).json({
                body: "Create product Successfully",
                product: product
            })
        } else {
            response.status(401).json({
                body: "Failed to save Product Details"
            })
        }
    }).catch(error => {
        next(error)
    })
}

exports.getAllProductOption = (request, response, next) => {

    Product.findAll({
        where: {status: 1},
        attributes: ["id", ["name", "text"]]
    }).then(product => {
        response.status(200).json({
            results: prodcut
        });
    }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllProductTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];
    Products.count().then(totalCount => {
        Products.findAll({
            attributes: {
                include: [
                    [Connection.literal(`(
                    SELECT name
                    FROM categories AS cat
                    WHERE
                        cat.id = Products.categoryId                        
                )`),
                    'category_name'],
                    [Connection.literal(`(
                    SELECT name
                    FROM categories AS cat
                    WHERE
                        cat.id = Products.subCategoryId                        
                )`),
                        'subCategory_name']

                    ],
                exclude:["categoryId","subCategoryId"]
            },
            where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
            order: [["createdAt", "DESC"]],
            limit: parseInt(length) || 10,
            offset: parseInt(start) || 0
        })
            .then((categories) => {
                response.status(200).json({
                    draw: parseInt(draw),
                    recordsTotal: totalCount,
                    recordsFiltered: categories.length,
                    data: categories
                });
            }).catch(error => {
            response.status(500).json({
                body: error.message
            })
        })
    }).catch(error => {
        response.status(400).json({
            body: "Not Found",
            exception: error
        });
    })
}

exports.getProductById = (request, response, next) => {

    let {productId} = request.body;
    console.log(productId)
    Products.findByPk(productId, {
        include: [{model: ProductImages, attributes: ["id", "path", "sequenceNumber"]}],
        attributes: ["id", "name", "description", "price", "salePrice", "categoryId",
             "metaTitle", "metaDescription", "categoryId", "priceQuantity", "specialDeliveryCharges"]
    })
        .then(async product => {
            if (product) {
                response.status(200).json(product)
            } else {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}

exports.getProductsByCategoryId = (request, response, next) => {

    let {categoryId, subCategoryId} = request.body;
    let whereBlock = {
        status: 1
    }
    if (categoryId) {
        whereBlock = {categeroyId: categoryId, status: 1}
    }
    if (categoryId && subCategoryId) {
        whereBlock = {categeroyId: categoryId, subCategoryId: subCategoryId, status: 1}
    }
    Product.findAll({
        where: whereBlock,
        include: [{model: ProductImages, attributes: ["id", "path", "sequenceNumber"]}],
        attributes: ["id", "name", "description", "price", "salePrice", "categoryId", "metaTitle", "metaDescription", "categoryId"]
    })
        .then(async product => {
            if (product) {
                response.status(200).json(product)
            } else {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}

exports.deleteProduct = (request, response, next) => {
    let productId = request.body.productId;
    Products.findByPk(productId, {include: ProductImages}).then(product => {
        if (!product) {
            let error = new Error("Product Not Found");
            error.status = 404;
            throw error;
        }
        if (Array.isArray(product.productImages)) {
            product.productImages.map(item => {
                clearImage(item.path);
            })
        }else if(product.productImages){
            clearImage(product.productImages.path);
        }else{
            console.log("No Image Found")
        }

        return product.destroy();
    }).then(count => {
        if (!count) {
            throw new Error("Failed to delete product");
        }
        return response.status(200).json({
            body: "Successfully delete product"
        })
    }).catch(error => {
        next(error);
    })
}

exports.updateProductStatus = (request, response, next) => {
    let {productId, status} = request.body;
    Connection.transaction(async (trans) => {
        return Products.findByPk(productId).then(product => {
            if (!product) {
                let error = new Error("Product Not Found");
                error.status = 404;
                throw error;
            }
            product.status = status;
            return product.save({transaction: trans});
        }).catch(error => {
            throw error
        })
    }).then(count => {
        if (!count) {
            throw new Error("Failed to update");
        }
        return response.status(200).json({
            body: "Successfully update"
        })
    }).catch(error => {
        next(error);
    })
}

exports.uploadProductsImages = (request, response, next) => {
    let {product_id} = request.body;

    if (request.files) {
        Connection.transaction(async (trans) => {
            return Products.findByPk(product_id).then(product => {
                if (product) {
                    let imagesObjects = request.files.productImages.map((image, index) => {
                        return {
                            path: image.path,
                            sequenceNumber: index,
                            ProductId: product.id
                        }
                    })
                    return ProductImages.bulkCreate(imagesObjects, {
                        transaction: trans
                    })
                } else {
                    let error = new Error("Product Not Found");
                    error.statusCode = 404;
                    throw error;
                }
            }).catch(error => {
                throw error;
            });
        }).then(() => {
            return response.status(200).json({
                body: "Successfully update"
            })
        }).catch(error => {
            console.log(error);
            next(error);
        });
    } else {
        let error = new Error("Required one image");
        error.statusCode = 401;
        next(error);
    }

}
exports.sequenceUpdate = (request, response, next) => {
    let categories =[[1,6],[2,5],[3,4],[4,3],[5,2],[6,1]] ;//request.body.categories;
    database.query(`INSERT INTO ?? (id, sequenceNumber)
                    VALUES ?
                    ON DUPLICATE KEY
    UPDATE sequenceNumber =
    VALUES (sequenceNumber)`, [tableName, categories])
        .then(results => {
            if (!results) {
                let error = new Error("Failed to update")
                error.statusCode = 401;
                throw  error;
            }
            return response.status(200).json({
                body: "Save Category sequence"
            })
        })
        .catch(error => {
            next(error);
        })
}


