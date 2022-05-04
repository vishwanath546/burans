const database = require('../model/db');
const tableName = 'coupon_code';
const mappingProductTableName = 'coupon_product_mapping';
const mappingUserTableName = 'coupon_user_mapping';
const {clearImage} = require('../util/helpers');


exports.getAllCategoriesOption = (request, response, next) => {
    database.query('select id, name as text from ?? where status=1 and isSubcategory=0 and activeStatus=1', [tableName])
        .then(categories => {
            response.status(200).json({
                results: [{id: -1, text: ""}, ...categories]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}
exports.saveCouponCode = async (request, response, next) => {

    let {
        code, description, amountOff, offType, applyTo, specifyProduct,
        specifyUser, minSubTotalAmount, startDate, endDate,
        limitUsers,
        updateOfferId
    } = request.body;

    let couponPhotos = null;
    if (request.files && request.files.offersImage) {
        couponPhotos = request.files.offersImage[0].path;
    }
    let object = {
        code: code,
        description: description,
        limitUsers: limitUsers,
        couponStart: startDate,
        couponEnd: endDate,
        discountAmount: amountOff,
        discountType: offType,
        applyTo: applyTo,
        status: 1,
        minSubTotalAmount: minSubTotalAmount
    };

    try {
        if (parseInt(updateOfferId) !== 0) {

            const connection = await database.transaction()
            await connection.beginTransaction();

            if(couponPhotos){
                object.photo = couponPhotos;
            }

            let [deleteProductResult, productError] = await connection.query(`delete from ?? where couponCodeId = ?`,
                [mappingProductTableName, updateOfferId]);
            if (productError) {
                await connection.rollback();
                let error = new Error("Failed to update");
                error.statusCode = 500;
                throw error
            }
            let [deleteUserResult, userError] = await connection.query(`delete from ?? where couponCodeId = ?`,
                [mappingUserTableName, updateOfferId]);
            if (userError) {
                await connection.rollback();
                let error = new Error("Failed to update");
                error.statusCode = 500;
                throw error
            }

            if (specifyProduct) {
                let specifyProducts;
                if (Array.isArray(specifyProduct)) {
                    specifyProducts = specifyProduct.map(i => [updateOfferId, i]);
                } else {
                    specifyProducts = [[updateOfferId, specifyProduct]];
                }
                let [updateResult, updateError] = await connection.query('insert into ?? (couponCodeId,productId) values ? ',
                    [mappingProductTableName, specifyProducts]);

                if (updateError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed To updated");
                }
            }

            if (specifyUser) {
                let specifyUsers;
                if (Array.isArray(specifyUser)) {
                    specifyUsers = specifyUser.map(i => [updateOfferId, i]);
                } else {
                    specifyUsers = [updateOfferId, specifyUser];
                }
                let [updateResult, updateError] = await connection.query('insert into ?? (couponCodeId,userId) values ? ',
                    [mappingUserTableName, specifyUsers]);

                if (updateError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed To updated");
                }
            }

            object.updatedAt = database.currentTimeStamp();
            let [updateResult, updateError] = await connection.query('update ?? set ? where ? ',
                [tableName, object, {id: updateOfferId}]);

            if (updateError) {
                await connection.rollback();
                connection.release();
                throw new Error("Failed To updated");
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Update Service Successfully"
            })

        } else {
            object.photo = couponPhotos;
            const connection = await database.transaction();
            await connection.beginTransaction();
            object.createdAt = database.currentTimeStamp();
            let [insertResult, insertError] = await connection.query('insert ?? set ?',
                [tableName, object]);

            if (insertError) {
                await connection.rollback();
                connection.release();
                throw new Error("Failed To updated");
            }

            if (specifyProduct) {
                let specifyProducts;
                if (Array.isArray(specifyProduct)) {
                    specifyProducts = specifyProduct.map(i => [insertResult.insertId, i]);
                } else {
                    specifyProducts = [insertResult.insertId, specifyProduct];
                }
                let [updateResult, updateError] = await connection.query('insert ?? (couponCodeId,productId) values ?',
                    [mappingProductTableName, specifyProducts]);

                if (updateError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed To updated");
                }
            }

            if (specifyUser) {
                let specifyUsers;
                if (Array.isArray(specifyUser)) {
                    specifyUsers = specifyUser.map(i => [insertResult.insertId, i]);
                } else {
                    specifyUsers = [insertResult.insertId, specifyUser];
                }
                let [updateResult, updateError] = await connection.query('insert ?? (couponCodeId,userId) values  ? ',
                    [mappingUserTableName, specifyUsers]);

                if (updateError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed To updated");
                }
            }

            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Create Category Successfully"
            })
        }

    } catch (error) {
        next(error)
    }

}
exports.getAllCouponTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(tableName, {status: 1})
        .then(totalCount => {
            return database.dataTableSource(tableName,
                ["id", "code", "description", "limitUsers",
                    "couponStart", "couponEnd","applyTo","status",
                    "(select count(CouponCodeId) from orders where CouponCodeId =coupon_code.id) as usageCount",
                    "createdAt"]
                , {activeStatus: 1}, 'createdAt', 'name', search, 'desc',
                parseInt(start), parseInt(length), false)
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

exports.getOfferById = (request,response,next)=>{
    let {offerId} = request.body;

    database.select(tableName, {status: 1, id: offerId,activeStatus:1},
        ["id", "code", "description", "limitUsers", "couponStart", "couponEnd", "discountAmount",
            "discountType", "applyTo", "minSubTotalAmount", "photo",
            "(select group_concat(productId) from coupon_product_mapping where couponCodeId=coupon_code.id) as products",
            "(select group_concat(userId) as name from coupon_user_mapping ap where ap.couponCodeId=coupon_code.id) as users",
        ])
        .then(result => {
            if (result.length === 0) {
                let error = new Error("Offer Not Found");
                error.statusCode = 404;
                throw error;
            }
            response.status(200).json(result[0]);
        })
        .catch(error => {
            next(error);
        })
}

exports.deleteOffer = (request,response,next)=>{
    let offerId = request.body.offerId;
    database.select(tableName, {id: offerId, status: 1, activeStatus: 1},
        ["id", "photo"])
        .then(offer => {
            if (offer.length === 0) {
                let error = new Error("Offer Not Found");
                error.status = 404;
                throw error;
            }
            return Promise.resolve(offer[0]);
        })
        .then(offer => {
            if (offer.photo !== "" && offer.photo !== null) {
                clearImage(offer.photo);
            }
            return database.update(tableName, {activeStatus: 0}, {id: offerId});
        })
        .then(result => {
            if (!result.status) {
                let error = new Error("Failed To delete");
                error.status = 404;
                throw error;
            }
            return response.status(200).json({
                body: "Successfully delete offer"
            })
        })
        .catch(error => {
            next(error);
        })
}

