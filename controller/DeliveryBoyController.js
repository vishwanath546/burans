const database = require('../model/db');
const {clearImage} = require('../util/helpers');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const deliveryTable = 'delivery_boy';
const userAuthTable = 'user_auth';
const deliveryLocationTable = "delivery_boys_locations";
const deliveryVendorTable = "delivery_boys_vendors";

exports.login_vendor = (request, response, next) => {
    let {username, password} = request.body;
    UserAuth.findOne({
        where: {mobileNumber: username, userType: 2},
    }).then((User) => {
        if (!User) {
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw  error;
        }
        return User;
    })
        .then((User) => {
            bcrypt.compare(password, User.password)
                .then(async (isMatch) => {
                    if (isMatch) {
                        User.loginAt = Date.now();
                        User.save({fields: ["loginAt"]});
                        let token = jwt.sign({
                            username: username,
                            userId: User.VendorId
                        }, process.env.JWT_SECRET, {expiresIn: '1h'})

                        response.status(200).json({
                            token: token,
                            body: await Vendor.findByPk(User.VendorId, {
                                include: [{model: UserAuth, attributes: ["userType", "rememberToken"]}],
                                attributes: ["id", "name", "email", "mobileNumber", "avatar", "shopName",
                                    "gstNumber", "foodLicense", "area", "accountStatus"]
                            }),
                        });
                    } else {
                        response.status(401).json({
                            body: "incorrect password",
                        });
                    }
                })
                .catch((error) => {
                    response.status(500).json({
                        status: 202,
                        body: "Something went wrong",
                        error: error.message,
                    });
                });
        })
        .catch((error) => {
            next(error)
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

        const user = await database.query("select id from user_auth where mobileNumber=? and DeliveryBoyId is not and activeStatus=1", [mobileNumber])

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
            licensePhoto: licenseImage,
            bikeRcPhoto: bikeRcImage,
            email: email,
            bikeRc: bikeRc,
            avatar: avatar,
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
            let allVendor = area.map(a => {
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

exports.vendorUpdate = async (request, response, next) => {

    let userId = request.params.userId;
    let updateBy = 1; //request.userId;
    let {name, shopName, email, mobileNumber, gstNumber, foodLicense, area} = request.body;
    let avatar;
    if (request.files) {
        avatar = request.files.shopImage[0].path;
    }

    try {
        const userResult = await database.query("select * from ? where id=(select deliveryBoyId from user_auth where deliveryBoyId=? and activeStatus=1)",
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

        if (userObject.mobileNumber !== mobileNumber) {
            if (updateObject.columns.findIndex(i => i === 'mobileNumber') === -1) {
                updateObject.columns.push('mobileNumber');
                updateObject.values.push(mobileNumber);
            }
        }
        if (userObject.shopName !== shopName) {
            if (updateObject.columns.findIndex(i => i === 'shopName') === -1) {
                updateObject.columns.push('shopName');
                updateObject.values.push(shopName);
            }
        }
        if (userObject.gstNumber !== gstNumber) {
            if (updateObject.columns.findIndex(i => i === 'gstNumber') === -1) {
                updateObject.columns.push('gstNumber');
                updateObject.values.push(gstNumber);
            }
        }
        if (userObject.foodLicense !== foodLicense) {
            if (updateObject.columns.findIndex(i => i === 'foodLicense') === -1) {
                updateObject.columns.push('foodLicense');
                updateObject.values.push(foodLicense);
            }
        }
        if (user.area !== area) {
            if (updateObject.columns.findIndex(i => i === 'area') === -1) {
                updateObject.columns.push('area');
                updateObject.values.push(area);
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
        const connection = await database.transaction();
        await connection.beginTransaction();
        const [result, deliveryUpdateError] = await connection.query('update ?? set ? where ?', [deliveryTable, user, {id: userId}]);
        if (deliveryUpdateError) {
            await connection.rollback();
            connection.release();
            throw new Error("Failed To Update Delivery");
        }
        if (userObject.mobileNumber !== mobileNumber) {
            const [userAuthResult, userAuthError] = await connection.query("update ?? set ? where ?", [userAuthTable, {mobileNumber: mobileNumber}, {DeliveryBoyId: userId}])
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
            body: "Create Category Successfully"
        })

    } catch (error) {
        next(error);
    }


}


exports.deleteDeliveryBoy = (request, response, next) => {

    let userId = request.body.deliveryBoyId;

    try{
        user

    }catch (error) {
        next(error)
    }
    DeliveryBoy.findByPk(userId).then(user => {
        if (!user) {
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw error;
        }
        console.log(user)
        clearImage(user.avatar);
        return user.destroy()
    }).then(count => {
        if (!count) {
            let error = new Error("Failed to delete Delivery Boy")
            error.statusCode = 500;
            throw error;
        }
        response.status(200).json({
            body: "Successfully delete Delivery Boy"
        })
    }).catch(error => {
        next(error)
    })
}


exports.getVendor = (request, response, next) => {
    let userId = request.body.vendorId;
    Vendor.findByPk(userId, {
        attributes: ["id", "name", "email", "mobileNumber", "avatar", "shopName", "gstNumber", "foodLicense",
            "area", "accountStatus"],
        include: [{
            model: UserAuth,
            attributes: ["userType", "loginAt"]
        }]
    }).then(user => {
        if (!user) {
            let error = new Error("User Not Found")
            error.statusCode = 404;
            throw error;
        }
        return response.status(200).json(user);
    }).catch(error => {
        next(error)
    })
}

exports.getAllDeliveryBoyTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(vendorTable, {activeStatus: 1})
        .then(totalCount => {
            database.dataTableSource(vendorTable, ["id", "name", "email", "mobileNumber", "gstNumber", "foodLicense",
                    "avatar", "accountStatus", "createdAt", "adminConfirmOn",
                    "(select group_concat(name) from location where id in(select locationId from vendor_locations where vendorId=vendor_user.id)) as area"],
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
        response.status(400).json({
            body: "Not Found",
            exception: error
        });
    })
    DeliveryBoy.count().then(totalCount => {
        DeliveryBoy.findAll({
            attributes: ["id", "name", "email", "mobileNumber", "license", "bikeRc",
                "avatar", "createdAt"],
            include: [{model: UserAuth, attributes: ["id"]},
                {
                    model: Location, as: 'DeliveryBoysLocations'
                }],
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
