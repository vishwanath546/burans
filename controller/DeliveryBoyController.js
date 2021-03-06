const database = require('../model/db');
const {clearImage} = require('../util/helpers');
const bcrypt = require("bcryptjs");

const deliveryTable = 'delivery_boy';
const userAuthTable = 'user_auth';
const deliveryLocationTable = "delivery_boys_locations";
const deliveryVendorTable = "delivery_boys_vendors";

exports.loginDeliveryBoy = (request, response, next) => {
    let {mobileNumber} = request.body;
    let User = null;
    database.select(userAuthTable, {mobileNumber: mobileNumber, userType: 3, activeStatus: 1},
        ["id", "DeliveryBoyId"])
        .then(user => {
            if (user.length === 0) {
                let error = new Error("Mobile number not register with us");
                error.statusCode = 404;
                throw error;
            }
            User = user;
            let OTP = Math.floor(1000 + Math.random() * 9000);
            let expiredAt = database.futureDateTime(15);
            return database
                .update(userAuthTable, {
                        otpToken: OTP,
                        otpExpiredAt: expiredAt,
                        updatedAt: database.currentTimeStamp(),
                    },
                    {id: User[0].id})
        })
        .then((resultObject) => {
            if (!resultObject) {
                throw new Error("Failed To Send OTP");
            } else {
                if(User ==null){
                    let error = new Error("Mobile number not register with us");
                    error.statusCode = 401;
                    throw error;
                }
                response.status(200).json({
                    id: btoa(User[0].UserId),
                    type: btoa(User[0].userType),
                });
            }
        })
        .catch((error) => {
            next(error);
        });

};

exports.otpDeliveryBoyVerification = (request, response, next) => {
    const {
        userId,
        otpNumberOne,
        otpNumberSecond,
        otpNumberThree,
        otpNumberFour,
    } = request.body;
    let otp = [otpNumberOne, otpNumberSecond, otpNumberThree, otpNumberFour].join("");
    let userID= atob(userId)
    console.log(userID,userId)
    database
        .query(
            "select DeliveryBoyId from ?? where activeStatus=1 and UserId=? and otpToken=? and otpExpiredAt > ?",
            [userAuthTable, userID, otp, database.currentTimeStamp()]
        )
        .then((user) => {
            if (user.length === 0) {
                let error = new Error("Invalid user or Otp");
                error.statusCode = 401;
                throw error;
            }
            return user[0];
        })
        .then((userAuth) => {
            return database.select(deliveryTable, { id: userAuth.DeliveryBoyId });
        })
        .then((user) => {
            if (user.length === 0) {
                let error = new Error("User Not Found");
                error.statusCode = 404;
                throw error;
            }
            return user[0];
        })
        .then(async (user) => {
            let userData = {
                authId: user.id,
                mobileNumber: user.mobileNumber,
                email: user.email,
                avatar: user.photo,
                license:user.license,
                licensePhoto:user.licensePhoto,
                bikeRc:user.bikeRc,
                bikeRcPhoto:user.bikeRcPhoto
            };
            request.session.user = userData;
            let UserAuthObject = {
                loginAt: database.currentTimeStamp(),
            };

            try {
                const connection = await database.transaction();
                await connection.beginTransaction();
                const [authResult, authError] = await connection.query(
                    "update ?? set ? where ?",
                    [userAuthTable, UserAuthObject, { DeliveryBoyId: user.id }]
                );
                if (authError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed to register");
                }
                await connection.commit();
                connection.release();
                response.status(200).json({
                    body: "Verify Successfully",
                    session: request.session,
                });
            } catch (error) {
                next(error);
            }
        })
        .catch((error) => {
            next(error);
        });
};

exports.DeliveryBoyRegistration = async (request, response, next) => {
    let {name, address, email, mobileNumber, license, bikeRc, area, vendor} = request.body;

    if (!request.files) {
        return response.status(401).json({
            status: 401,
            body: "no image provided"
        })
    }
    let avatar, licenseImage, bikeRcImage;
    if (request.files && request.files.profileImage) {
        avatar = request.files.profileImage[0].path;
    }
    if (request.files && request.files.licenseImage) {
        licenseImage = request.files.licenseImage[0].path;
    }
    if (request.files && request.files.bikeRcImage) {
        bikeRcImage = request.files.bikeRcImage[0].path;
    }

    try {

        const user = await database.query("select id from user_auth where mobileNumber=? and activeStatus=1  and DeliveryBoyId is not null", [mobileNumber])

        if (user.length > 0) {
            let error = new Error("User Already register with mobile number");
            error.statusCode = 403;
            throw error;
        }

        let connection = await database.transaction();
        await connection.beginTransaction()
        let deliveryBoyObject = {
            name: name,
            address: address,
            mobileNumber: mobileNumber,
            license: license,
            photo: avatar,
            licensePhoto: licenseImage,
            bikeRcPhoto: bikeRcImage,
            email: email,
            bikeRc: bikeRc,
        };

        const [deliveryResult, deliveryError] = await connection.query("insert into ?? set ?", [deliveryTable, deliveryBoyObject])
        if (deliveryError) {
            await connection.rollback();
            connection.release()
            throw new Error("Failed To Create Delivery Boy");
        }
        if (area) {
            let allAreas = area.map(a => {
                return connection.query("insert into ?? set ?", [deliveryLocationTable,
                    {locationId: a, deliveryBoyId: deliveryResult.insertId}
                ]);
            });
            Promise.all(allAreas).then(async (areaResult, areaError) => {
                if (areaError) {
                    await connection.rollback();
                    connection.release()
                    throw new Error("Failed To Create Vendor Areas");
                }
            })
        }
        if (vendor) {
            let allVendor = vendor.map(a => {
                return connection.query("insert into ?? set ?", [deliveryVendorTable,
                    {vendorId: a, deliveryBoyId: deliveryResult.insertId}
                ]);
            });
            Promise.all(allVendor).then(async (areaResult, areaError) => {
                if (areaError) {
                    await connection.rollback();
                    connection.release()
                    throw new Error("Failed To Create Vendor Areas");
                }
            })
        }
        const hashPassword = await bcrypt.hash("123456", 12);
        const [userAuthResult, userAuthError] = await connection.query("insert into ?? set ?", [userAuthTable, {
            userType: 3,
            mobileNumber: mobileNumber,
            password: hashPassword,
            DeliveryBoyId: deliveryResult.insertId,
            createdAt: database.currentTimeStamp()
        }])
        if (userAuthError) {
            await connection.rollback();
            connection.release()
            throw new Error("Failed To Create Delivery Boy");
        }


        await connection.commit();
        connection.release()
        response.status(200).json({
            body: "Delivery Boy Register successfully!"
        })
    } catch (error) {
        next(error)
    }
};

exports.deliveryBoyUpdate = async (request, response, next) => {

    let userId = request.params.userId;
    let updateBy = 1; //request.userId;
    let {name, address, email, mobileNumber, license, bikeRc, area, vendor} = request.body;

    let avatar, licenseImage, bikeRcImage;
    if (request.files && request.files.profileImage) {
        avatar = request.files.profileImage[0].path;
    }

    try {
        const userResult = await database.query("select *,(select group_concat(vendorId) from delivery_boys_vendors where deliveryBoyId=delivery_boy.id) as vendors, (select group_concat(locationId) from delivery_boys_locations where deliveryBoyId=delivery_boy.id) as areas from ?? where id=(select deliveryBoyId from user_auth where deliveryBoyId=? and activeStatus=1)",
            [deliveryTable, userId]);

        if (userResult.length === 0) {
            let error = new Error("Unauthorized access");
            error.statusCode = 401;
            throw error;
        }
        let userObject = userResult[0];
        let updateObject = {columns: [], values: []};
        let user = {};
        if (userObject.updateOnColumn != null && userObject.updateOnColumn !== "") {
            updateObject = JSON.parse(userObject.updateOnColumn);
        }

        user.name = name;
        user.email = email;
        user.address = address;
        if (userObject.mobileNumber !== mobileNumber) {
            if (updateObject.columns.findIndex(i => i === 'mobileNumber') === -1) {
                updateObject.columns.push('mobileNumber');
                updateObject.values.push(mobileNumber);
            }
        }
        if (userObject.license !== license) {
            if (updateObject.columns.findIndex(i => i === 'license') === -1) {
                updateObject.columns.push('license');
                updateObject.values.push(license);
            }
        }
        if (userObject.bikeRc !== bikeRc) {
            if (updateObject.columns.findIndex(i => i === 'bikeRc') === -1) {
                updateObject.columns.push('bikeRc');
                updateObject.values.push(bikeRc);
            }
        }
        if (request.files && request.files.licenseImage) {
            licenseImage = request.files.licenseImage[0].path;
            if (updateObject.columns.findIndex(i => i === 'licensePhoto') === -1) {
                updateObject.columns.push('licensePhoto');
                updateObject.values.push(licenseImage);
            }
        }
        if (request.files && request.files.bikeRcImage) {
            bikeRcImage = request.files.bikeRcImage[0].path;
            if (updateObject.columns.findIndex(i => i === 'bikeRcPhoto') === -1) {
                updateObject.columns.push('bikeRcPhoto');
                updateObject.values.push(bikeRcImage);
            }
        }

        if (user.areas !== area) {
            if (updateObject.columns.findIndex(i => i === 'area') === -1) {
                updateObject.columns.push('area');
                updateObject.values.push(area);
            }
        }
        if (user.vendors !== vendor) {
            if (updateObject.columns.findIndex(i => i === 'vendors') === -1) {
                updateObject.columns.push('vendors');
                updateObject.values.push(vendor);
            }
        }
        if (avatar) {
            user.photo = avatar;
        }
        if (updateObject.columns.length > 0) {
            user.adminConfirmOn = 0;
            user.updateOnColumn = JSON.stringify(updateObject);
        }
        user.updateBy = updateBy;
        user.updatedAt = database.currentTimeStamp();
        if (updateObject.columns.length > 0) {
            user.adminConfirmOn = 0;
            user.updateOnColumn = JSON.stringify(updateObject);
        }
        const connection = await database.transaction();
        await connection.beginTransaction();
        const [result, deliveryUpdateError] = await connection.query('update ?? set ? where ?', [deliveryTable, user, {id: userId}]);
        if (deliveryUpdateError) {
            await connection.rollback();
            connection.release();
            throw new Error("Failed To Update Delivery");
        }
        if (userObject.mobileNumber !== mobileNumber) {
            const [userAuthResult, userAuthError] = await connection.query("update ?? set ? where ?", [userAuthTable, {
                mobileNumber: mobileNumber,
                updatedAt: database.currentTimeStamp()
            }, {DeliveryBoyId: userId}])
            if (userAuthError) {
                await connection.rollback();
                connection.release();
                throw new Error("Failed To Update Delivery");
            }
        }
        if (avatar) {
            clearImage(userObject.photo)
        }
        await connection.commit();
        connection.release()
        return response.status(200).json({
            body: "Update delivery boy details successfully"
        })

    } catch (error) {
        next(error);
    }


}

exports.deleteDeliveryBoy = async (request, response, next) => {

    let userId = request.body.deliveryBoyId;

    try {
        const connection = await database.transaction();
        await connection.beginTransaction();
        let [delivery, meta] = await connection.query("select id,photo,licensePhoto,bikeRcPhoto from ?? where id=?", [deliveryTable, userId]);
        if (delivery.length === 0) {
            connection.release();
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw error;
        }

        let [userAuthResult, userAuthError] = await connection.query("update ?? set ? where ?", [userAuthTable, {activeStatus: 0}, {DeliveryBoyId: delivery[0].id}]);
        if (userAuthError) {
            await connection.rollback();
            connection.release();
            let error = new Error("Failed To Delete Delivery Boy");
            error.statusCode = 401;
            throw error;
        }

        let [deliveryResult, deliveryError] = await connection.query("update ?? set ? where ?",
            [deliveryTable, {activeStatus: 0, deletedAt: database.currentTimeStamp()}, {id: delivery[0].id}]);
        if (deliveryError) {
            await connection.rollback();
            connection.release();
            let error = new Error("Failed To Delete Delivery Boy");
            error.statusCode = 401;
            throw error;
        }

        await connection.commit();
        if (delivery[0].photo) {
            clearImage(delivery[0].photo);
        }
        if (delivery[0].licensePhoto) {
            clearImage(delivery[0].licensePhoto);
        }
        if (delivery[0].bikeRcPhoto) {
            clearImage(delivery[0].bikeRcPhoto);
        }
        connection.release()
        response.status(200).json({
            body: "Delete Delivery Boy Successfully"
        })
    } catch (error) {
        next(error)
    }
}

exports.getDeliveryBoy = (request, response, next) => {
    let userId = request.body.deliveryBoyId;
    database.select(deliveryTable, {id: userId},
        ["id", "name", "email", "mobileNumber", "photo", "address", "bikeRc", "license",
            "accountStatus", "updateOnColumn", "adminConfirmOn", "licensePhoto", "bikeRcPhoto",
            "(select group_concat(vendorId) from delivery_boys_vendors where deliveryBoyId=delivery_boy.id) as vendors",
            "(select group_concat(locationId) from delivery_boys_locations where deliveryBoyId=delivery_boy.id) as areas"])
        .then(user => {
            if (user.length === 0) {
                let error = new Error("User Not Found")
                error.statusCode = 404;
                throw error;
            }
            return response.status(200).json(user[0]);
        }).catch(error => {
        next(error)
    })
}

exports.getAllDeliveryBoyTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(deliveryTable)
        .then(totalCount => {
            database.dataTableSource(deliveryTable, [
                    "id", "name", "email", "mobileNumber", "license", "bikeRc",
                    "photo", "createdAt", "adminConfirmOn",
                    "(select group_concat(shopName) from vendor_user  where activeStatus=1 and id in(select vendorId from delivery_boys_vendors where deliveryBoyId=delivery_boy.id)) as vendors",
                    "(select group_concat(name) from location where active_status=1 and id in(select locationId from delivery_boys_locations where deliveryBoyId=delivery_boy.id)) as areas",
                ],
                {activeStatus: 1},
                'createdAt', 'name', search, "desc", parseInt(start), parseInt(length), false)
                .then(result => {
                    return response.status(200).json({
                        draw: parseInt(draw),
                        recordsTotal: totalCount,
                        recordsFiltered: result.length,
                        data: result
                    });
                })
        }).catch(error => {
        return response.status(200).json({
            draw: 1,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        });
    });
}

exports.approval = (request, response, next) => {
    let userId = request.body.deliveryBoyId;
    let column = request.body.column;

    database.select(deliveryTable, {id: userId, adminConfirmOn: 0}, ["id", "updateOnColumn", "adminConfirmOn"])
        .then(async deliveryBoy => {
            if (deliveryBoy.length === 0) {
                let error = new Error("User Not Found");
                error.statusCode = 404;
                throw error;
            }
            if (parseInt(deliveryBoy[0].adminConfirmOn) === 0) {
                let object = JSON.parse(deliveryBoy[0].updateOnColumn);
                let updateObject = {};
                let columnIndex = -1;
                let columnValue;
                if (object.columns.length !== 0) {
                    columnIndex = object.columns.findIndex(value => value === column);
                    if (columnIndex !== -1) {
                        if (column !== "area" && column !== "vendors") {
                            updateObject[column] = object.values[columnIndex];
                        }
                        columnValue = object.values[columnIndex];
                        object.columns.splice(columnIndex, 1);
                        object.values.splice(columnIndex, 1);
                    }
                    if (object.columns.length === 0) {
                        updateObject.updateOnColumn = null;
                        updateObject.adminConfirmOn = 1;
                    } else {
                        updateObject.updateOnColumn = JSON.stringify(object);
                    }
                } else {
                    updateObject.adminConfirmOn = 1;
                }
                if (column === "area") {
                    let connection = await database.transaction();
                    await connection.beginTransaction();
                    const [result, error] = await connection.query("delete from ?? where ?", [deliveryLocationTable, {deliveryBoyId: userId}]);
                    if (error) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    let updateArea = [];
                    if (Array.isArray(columnValue)) {
                        updateArea = columnValue.map(i => [userId, i]);
                    } else {
                        updateArea.push([userId, columnValue]);
                    }
                    const [insertResult, insertError] = await connection.query("insert into ?? (deliveryBoyId,locationId) values ?", [deliveryLocationTable, updateArea])
                    if (insertError) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    const [updateResult, updateError] = await connection.query("update ?? set ? where ?", [deliveryTable, updateObject, {id: userId}]);
                    if (updateError) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    await connection.commit();
                    connection.release();
                    return Promise.resolve({error: null});
                } else if (column === "vendors") {
                    let connection = await database.transaction();
                    await connection.beginTransaction();
                    const [result, error] = await connection.query("delete from ?? where ?", [deliveryVendorTable, {deliveryBoyId: userId}]);
                    if (error) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    let updateVendor = [];
                    if (Array.isArray(columnValue)) {
                        updateVendor = columnValue.map(i => [userId, i]);
                    } else {
                        updateVendor.push([userId, columnValue]);
                    }
                    const [insertResult, insertError] = await connection.query("insert into ?? (deliveryBoyId,vendorId) values ?", [deliveryVendorTable, updateVendor])
                    if (insertError) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    const [updateResult, updateError] = await connection.query("update ?? set ? where ?", [deliveryTable, updateObject, {id: userId}]);
                    if (updateError) {
                        let error = new Error("Failed To update");
                        await connection.rollback();
                        connection.release();
                        error.statusCode = 401;
                        throw error;
                    }
                    await connection.commit();
                    connection.release();
                    return Promise.resolve({error: null});
                } else {
                    return database.update(deliveryTable, updateObject, {id: userId});
                }

            } else {
                return database.update(deliveryTable, {adminConfirmOn: 1}, {id: userId});
            }
        })
        .then(result => {
            if (result.error) {
                let error = new Error("Failed To update");
                error.statusCode = 401;
                throw error;
            }
            return response.status(200).json({message: "Save Changes"});
        })
        .catch(error => {
            next(error);
        })
}
