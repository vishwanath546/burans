const database = require('../model/db');
const tableName = 'addons_products';
const {clearImage} = require('../util/helpers');

exports.saveAddOnsProduct = (request, response, next) => {
    let {
        name, description, price, status,
        updateProductId
    } = request.body;

    let productPhotos = null;
    if (request.files && request.files.addOnsProductImage) {
        productPhotos = request.files.addOnsProductImage[0].path;
    }
    let ProductObject = {
        name: name,
        description: description,
        price: price,
        status: status,
    };

    database.select(tableName, {id: updateProductId})
        .then(product => {
            if (productPhotos) {
                ProductObject.photo = productPhotos;
            }
            if (product.length === 0) {
                ProductObject.createdAt=database.currentTimeStamp();
                return database.insert(tableName, ProductObject)
            } else {
                ProductObject.updatedAt=database.currentTimeStamp();
                if (product[0].photo && productPhotos) {
                    clearImage(product[0].photo)
                }
                return database.update(tableName, ProductObject, {id: product[0].id})
            }
        })
        .then(result => {
            if (result.status) {
                response.status(200).json({
                    body: "Create product Successfully",
                });
            } else {
                response.status(401).json({
                    body: "Failed to save Product Details"
                });
            }
        }).catch(error => {
        next(error)
    })
}

exports.getAllAddOnsProductOption = (request, response, next) => {

    database.select(tableName, {status: 1, activeStatus: 1}, ["id", "name", "description", "photo", "price"])
        .then(product => {
            response.status(200).json({
                results: product
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAllOnsProductTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(tableName, {activeStatus: 1})
        .then(totalCount => {
            database.dataTableSource(tableName, ["id", "name", "description", "price", "photo", "status"],
                {activeStatus: 1},
                'createdAt', 'name', search, "desc", parseInt(start), parseInt(length))
                .then(result => {
                    return response.status(200).json({
                        draw: parseInt(draw),
                        recordsTotal: totalCount,
                        recordsFiltered: result.length,
                        data: result
                    });
                })
        })
        .catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}

exports.getAddOnsProductById = (request, response, next) => {

    let {productId} = request.body;
    database.select(tableName, {id: productId}, ["id", "name", "description", "price", "photo", "status"])
        .then(product => {
            if (product.length > 0) {
                response.status(200).json(product[0])
            } else {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error;
            }
        }).catch(error => {
        next(error);
    })
}

exports.deleteAddOnsProduct = (request, response, next) => {
    let productId = request.body.productId;

    database.select(tableName, {id: productId})
        .then(product => {
            if (product.length === 0) {
                let error = new Error("Product Not Found");
                error.status = 404;
                throw error;
            }
            if (product[0].photo) {
                clearImage(product[0].photo);
            }
            return database.update(tableName, {activeStatus: 0, deletedAt:database.currentTimeStamp()}, {id: productId});
        }).then(results => {
        if (!results.status) {
            throw new Error("Failed to delete product");
        }
        return response.status(200).json({
            body: "Successfully delete product"
        })
    }).catch(error => {
        next(error);
    })
}
