const {Connection} = require('../model/Database');
const {Op} = require('sequelize');
const {AddOnsProduct} = require('../model/AddOnsProduct');
const {clearImage} = require('../util/helpers');

exports.saveAddOnsProduct= (request,response,next)=>{
    let {
        name, description, price, status,
        updateProductId
    } = request.body;

    let productPhotos = null;
    if (request.files && request.files.addOnsProductImage) {
        productPhotos = request.files.addOnsProductImage[0].path;
    }
    Connection.transaction(async (trans) => {
        return AddOnsProduct.findByPk(updateProductId).then(async product => {
            let ProductObject = {
                name: name,
                description: description,
                price: price,
                status: status,
            };
            if(productPhotos){
                ProductObject.photo=productPhotos;
            }
            if(!product){
                return AddOnsProduct.create(ProductObject, {transaction: trans});
            }else{
                if(product.photo && productPhotos){
                    clearImage(product.photo)
                }
                return await AddOnsProduct.update(ProductObject, {where: {id: product.id}},{transaction:trans})
            }
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

exports.getAllAddOnsProductOption = (request, response, next) => {

    AddOnsProduct.findAll({
        where: {status: 1},
        attributes: ["id", "name", "description","photo","price"]
    }).then(product => {
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
    AddOnsProduct.count().then(totalCount => {
        AddOnsProduct.findAll({
            attributes: ["id","name","description","price","photo","status"],
            where: search ? {name: {[Op.like]: "%" + search + "%"}} : {},
            order: [["createdAt", "DESC"]],
            limit: parseInt(length) || 10,
            offset: parseInt(start) || 0
        })
            .then((products) => {
                response.status(200).json({
                    draw: parseInt(draw),
                    recordsTotal: totalCount,
                    recordsFiltered: products.length,
                    data: products
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

exports.getAddOnsProductById = (request, response, next) => {

    let {productId} = request.body;
    console.log(productId)
    AddOnsProduct.findByPk(productId, {
        attributes: ["id", "name", "description", "price","photo","status"]
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

exports.deleteAddOnsProduct = (request, response, next) => {
    let productId = request.body.productId;

    AddOnsProduct.findByPk(productId).then(product => {
        console.log(productId,product)
        if (!product) {
            let error = new Error("Product Not Found");
            error.status = 404;
            throw error;
        }
        if(product.photo){
            clearImage(product.photo);
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
