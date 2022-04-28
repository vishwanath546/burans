const database = require('../model/db');
const productTableName = "products";
const imageTableName = "product_images";
const vendorProductTableName = "vendor_product";
const suggestedProductMappingTableName = 'suggested_item_mapping';
const addOnProductMappingTableName = 'addon_product_mapping';
const {clearImage} = require('../util/helpers');


exports.saveProductDetails = async (request, response, next) => {

    let {
        product_name, product_description, category, subcategory,
        type, addOnsProduct, suggestedProduct, suggestedCategory,
        status, price, sale_price, price_quantity, special_delivery_charges,
        inventoryQuantity, inventoryType, duration, minStockQuantity, vendor,
        product_meta_title, product_meta_description,
        product_id
    } = request.body;
    let ProductObject = {
        name: product_name,
        description: product_description,
        categoryId: category,
        subCategoryId: subcategory,
        price: price,
        salePrice: sale_price,
        priceQuantity: price_quantity,
        specialDeliveryCharges: special_delivery_charges,
        metaTitle: product_meta_title,
        metaDescription: product_meta_description,
        status: status,
        inventoryQuantity: inventoryQuantity,
        inventoryType: inventoryType,
        duration: duration,
        minStockQty: minStockQuantity,
        type: type,
    };

    try {
        const connection = await database.transaction();
        await connection.beginTransaction();

        if (parseInt(product_id)!==0) {
            // update
            let updateAddOnsProduct = [];
            if (addOnsProduct) {
                if (Array.isArray(addOnsProduct)) {
                    updateAddOnsProduct = addOnsProduct.map(i => [product_id, i, database.currentTimeStamp()]);
                } else {
                    updateAddOnsProduct.push([product_id, addOnsProduct, database.currentTimeStamp()]);
                }
            }
            let updateSuggestion = [];
            if (suggestedProduct) {
                if (Array.isArray(suggestedProduct)) {
                    updateSuggestion = suggestedProduct.map(i => [product_id, database.currentTimeStamp(), i, null]);
                } else {
                    updateSuggestion.push([product_id, database.currentTimeStamp(), suggestedProduct, null]);
                }
            }
            if (suggestedCategory) {
                if (Array.isArray(suggestedCategory)) {
                    updateSuggestion = suggestedCategory.map(i => [product_id, database.currentTimeStamp(), null, i]);
                } else {
                    updateSuggestion.push([product_id, database.currentTimeStamp(), null, suggestedCategory]);
                }
            }

            const [productResult, productError] = await connection.query("update ?? set ? where ?",
                [productTableName, ProductObject, {id: product_id}]);

            if (productError) {
                await connection.rollback();
                connection.release();
                let error = new Error("Failed To update product");
                throw error;
            }

            const [addOnDeleteResult, addOnDeleteError] = await connection.query("delete from  ?? where ?",
                [addOnProductMappingTableName, {ProductId: product_id}])
            if (addOnDeleteError) {
                await connection.rollback();
                connection.release();
                let error = new Error("Failed To update product");
                throw error;
            }

            const [addOnCategoryDeleteResult, addOnCategoryDeleteError] = await connection.query("delete from  ?? where ?",
                [suggestedProductMappingTableName, {ProductId: product_id}])
            if (addOnCategoryDeleteError) {
                await connection.rollback();
                connection.release();
                let error = new Error("Failed To update product");
                throw error;
            }

            const [deleteVendorResult, deleteVendorError] = await connection.query("delete from ?? where ?", [vendorProductTableName, {ProductId: product_id}]);
            if (deleteVendorError) {
                let error = new Error("Failed To update");
                await connection.rollback();
                connection.release();
                error.statusCode = 401;
                throw error;
            }

            if (updateAddOnsProduct.length > 0) {
                const [insertAddonProductResult, insertAddonProductError] = await connection.query("insert into ?? (ProductId,AddOnsProductId,createdAt) values ?",
                    [addOnProductMappingTableName, updateAddOnsProduct])
                if (insertAddonProductError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }
            if (updateSuggestion.length > 0) {
                const [insertSuggestionResult, insertSuggestionError] = await connection.query("insert into ?? (ProductId,createdAt,SuggestedProductId,CategoryId) values ?",
                    [suggestedProductMappingTableName, updateSuggestion])
                if (insertSuggestionError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }

            if (vendor) {
                const [insertVendorResult, insertVendorError] = await connection.query("insert into ?? set ?",
                    [vendorProductTableName, {ProductId: product_id, VendorId: vendor}])
                if (insertVendorError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }

            await connection.commit();
            connection.release();
            response.status(200).json({id:product_id,message: "Product update successfully"});
        } else {
            const [productResult, productError] = await connection.query("insert ?? set ?",
                [productTableName, ProductObject]);
            if (productError) {
                await connection.rollback();
                connection.release();
                let error = new Error("Failed To update product");
                throw error;
            }
            let updateAddOnsProduct = [];
            if (addOnsProduct) {
                if (Array.isArray(addOnsProduct)) {
                    updateAddOnsProduct = addOnsProduct.map(i => [productResult.insertId, i, database.currentTimeStamp()]);
                } else {
                    updateAddOnsProduct.push([productResult.insertId, addOnsProduct, database.currentTimeStamp()]);
                }
            }
            if (updateAddOnsProduct.length > 0) {
                const [insertAddonProductResult, insertAddonProductError] = await connection.query("insert into ?? (ProductId,AddOnsProductId,createdAt) values ?",
                    [addOnProductMappingTableName, updateAddOnsProduct])
                if (insertAddonProductError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }
            let updateSuggestion = [];
            if (suggestedProduct) {
                if (Array.isArray(suggestedProduct)) {
                    updateSuggestion = suggestedProduct.map(i => [productResult.insertId, database.currentTimeStamp(), i, null]);
                } else {
                    updateSuggestion.push([productResult.insertId, database.currentTimeStamp(), suggestedProduct, null]);
                }
            }
            if (suggestedCategory) {
                if (Array.isArray(suggestedCategory)) {
                    updateSuggestion = suggestedCategory.map(i => [productResult.insertId, database.currentTimeStamp(), null, i]);
                } else {
                    updateSuggestion.push([productResult.insertId, database.currentTimeStamp(), null, suggestedCategory]);
                }
            }
            if (updateSuggestion.length > 0) {
                const [insertSuggestionResult, insertSuggestionError] = await connection.query("insert into ?? (ProductId,createdAt,SuggestedProductId,CategoryId) values ?",
                    [suggestedProductMappingTableName, updateSuggestion])
                if (insertSuggestionError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }
            if (vendor) {
                const [insertVendorResult, insertVendorError] = await connection.query("insert into ?? set ?",
                    [vendorProductTableName, {ProductId: productResult.insertId, VendorId: vendor}])
                if (insertVendorError) {
                    let error = new Error("Failed To update");
                    await connection.rollback();
                    connection.release();
                    error.statusCode = 401;
                    throw error;
                }
            }
            await connection.commit();
            connection.release();
            response.status(200).json({id:productResult.insertId,message: "Product create successfully"});
        }
    } catch (error) {
        next(error);
    }
}

exports.getAllProductOption = (request, response, next) => {

    database.select(productTableName, {status: 1}, ["id", "name as text"])
        .then(product => {

            response.status(200).json({
                results: [{id: -1, text: "", disabled: true}, ...product]
            });
        }).catch(error => {
        next(error);
    })
}

exports.getAllProduct = (request, response, next) => {
    database.select(productTableName, {status: 1},
        ["id", "name", "description", "salePrice", "price",
            "(select path from product_images where ProductId=products.id limit 1) as photo",
            "(select (select shopName from vendor_user where id = vp.VendorId) as vendor_name from vendor_product vp where vp.ProductId=products.id) as vendor"
        ])
        .then(result => {
            if (result.length === 0) {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error
            }
            return response.status(200).json(result);
        })
        .catch(error => {
            next(error);
        })
}

exports.getAllProductTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(productTableName, {status: 1})
        .then(totalCount => {
            return database.dataTableSource(productTableName,
                ["id", "name", "description", "price", "salePrice", "status", "priceQuantity", "specialDeliveryCharges",
                    "(select path from product_images where ProductId=id limit 1) as photo",
                    "(select name from category where id = categoryId) as category",
                    "(select name from category where id = subcategoryId and isSubcategory=1) as subcategory",
                    "(select (select name from vendor_user where id=vp.VendorId) as name from vendor_product vp where vp.ProductId=id) as vendor",
                    "createdAt"]
                , {status: 1}, 'createdAt', 'name', search, 'desc',
                parseInt(start), parseInt(length),false)
                .then(result => {
                    return response.status(200).json({
                        draw: parseInt(draw),
                        recordsTotal: result.length,
                        recordsFiltered: totalCount,
                        data: result
                    });
                }).catch(error => {
                    next(error);
                });
        })
        .catch(error => {
            next(error);
        })
}

exports.getProductById = (request, response, next) => {

    let {productId} = request.body;

    database.select(productTableName, {status: 1, id: productId},
        ["id", "name", "description", "price", "salePrice", "categoryId", "subcategoryId",
            "inventoryQuantity", "inventoryType", "type", "duration", "minStockQty",
            "metaTitle", "metaDescription", "priceQuantity", "specialDeliveryCharges",
            "(select group_concat(path) from product_images where ProductId=id) as photo",
            "(select VendorId as name from vendor_product vp where vp.ProductId=id) as vendor",
            "(select group_concat(AddOnsProductId) as name from addon_product_mapping ap where ap.ProductId=id) as addOnsProducts",
            "(select group_concat(SuggestedProductId) as name from suggested_item_mapping sp where sp.ProductId=id) as suggestedProducts",
            "(select group_concat(CategoryId) as name from suggested_item_mapping si where si.ProductId=id) as suggestedCategory",

        ])
        .then(result => {
            if (result.length === 0) {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error;
            }
            response.status(200).json(result);
        })
        .catch(error => {
            next(error);
        })
}

exports.getProductsByCategoryId = (request, response, next) => {

    let {categoryId, subCategoryId} = request.body;
    let whereBlock = {
        status: 1,
        activeStatus: 1
    }
    if (categoryId) {
        whereBlock.categeroyId = categoryId;
    }
    if (categoryId && subCategoryId) {
        whereBlock.categeroyId = categoryId;
        whereBlock.subCategoryId = subCategoryId;
    }

    database.select(productTableName, whereBlock,
        ["id", "name", "description", "price", "salePrice", "categoryId", "subcategoryId",
            "inventoryQuantity", "inventoryType", "type", "duration", "minStockQty",
            "metaTitle", "metaDescription", "priceQuantity", "specialDeliveryCharges",
            "(select group_concat(path) from product_images where ProductId=id) as photo",
            "(select VendorId as name from vendor_product vp where vp.ProductId=id) as vendor",
            "(select group_concat(AddOnsProductId) as name from addon_product_mapping where vp.ProductId=id) as addOnsProducts",
            "(select group_concat(SuggestedProductId) as name from suggested_item_mapping where vp.ProductId=id) as suggestedProducts",
            "(select group_concat(CategoryId) as name from suggested_item_mapping where vp.ProductId=id) as suggestedCategory",

        ])
        .then(result => {
            if (result.length === 0) {
                let error = new Error("Product Not Found");
                error.statusCode = 404;
                throw error;
            }
            response.status(200).json(result);
        })
        .catch(error => {
            next(error);
        })
}

exports.deleteProduct = (request, response, next) => {
    let productId = request.body.productId;
    database.select(productTableName, {id: productId, status: 1, activeStatus: 1},
        ["id", "(select group_concat(path) from product_images where ProductId=id) as productImages"])
        .then(product => {
            if (product.length === 0) {
                let error = new Error("Product Not Found");
                error.status = 404;
                throw error;
            }
            return Promise.resolve(product[0]);
        })
        .then(product => {
            if (product.productImages !== "" && product.productImages !== null) {
                product.productImages.split(",").map(path => {
                    clearImage(path);
                });
            }
            return database.update(productTableName, {activeStatus: 1}, {id: productId});
        })
        .then(result => {
            if (!result.status) {
                let error = new Error("Failed To delete");
                error.status = 404;
                throw error;
            }
            return response.status(200).json({
                body: "Successfully delete product"
            })
        })
        .catch(error => {
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
        let imagesObjects = request.files.productImages.map((image, index) => {
            return [
                image.path,
                index,
                product_id,
                database.currentTimeStamp()
            ]
        });
        database.query("insert into ?? (path,sequenceNumber,ProductId,createdAt) values ?", [imageTableName, imagesObjects])
            .then(result => {
                if (!result) {
                    let error = new Error("Failed To insert product image");
                    error.statusCode = 404;
                    throw error;
                }
                return response.status(200).json({
                    body: "Successfully update"
                })
            })
            .catch(error => {
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
    let products = request.body.products;
    let productsObject = products.map((product, index) => [product, index]);
    database.query(`INSERT INTO ?? (id, sequenceNumber)
                    VALUES ?
                    ON DUPLICATE KEY
    UPDATE sequenceNumber =
    VALUES (sequenceNumber)`, [productTableName, productsObject])
        .then(results => {
            if (!results) {
                let error = new Error("Failed to update")
                error.statusCode = 401;
                throw  error;
            }
            return response.status(200).json({
                body: "Save product sequence"
            })
        })
        .catch(error => {
            next(error);
        })
}


