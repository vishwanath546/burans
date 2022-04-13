const {Connection} = require("../model/Database");
const {Op} = require('sequelize');
const {Vendor} = require("../model/Vendor");
const {Location} = require("../model/Location");
const {UserAuth} = require('../model/UserAuth');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');

const clearImage = imagePath => {
    let filePath = path.join(__dirname, '..', imagePath);
    fs.unlink(filePath, error => {
        if (error) console.log("Failed to delete image at update", error)
    })
}

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

exports.vendorRegistration = (request, response, next) => {
    let {name, shopName, email, mobileNumber, gstNumber, foodLicense, area} = request.body;

    Connection.transaction(async (trans) => {
        const hashPassword = await bcrypt.hash("123456", 12);

        if (!request.files) {
            return response.status(401).json({
                status: 401,
                body: "no image provided"
            })
        }
        const avatar = request.files.shopImage[0].path;
        let newVendor = await Vendor.create({
            name: name,
            shopName: shopName,
            mobileNumber: mobileNumber,
            gstNumber: gstNumber,
            email: email,
            foodLicense: foodLicense,
            accountStatus: 2,
            avatar: avatar,
        }, {transaction: trans});
        let locations = await Location.findAll({
            where: {
                id: {
                    [Op.in]: [...area]
                }
            }
        });
        newVendor.addVendorLocations([...locations])


        return await newVendor.createUserAuth({
            userType: 2,
            mobileNumber: mobileNumber,
            password: hashPassword,
        }, {transaction: trans});
    }).then(() => {
        response.status(200).json({
            status: 200,
            body: "Vendor Register successfully!",
        });
    }).catch(error => {
        next(error)
    });
};

exports.vendorUpdate = (request, response, next) => {

    console.log("hii");
    let userId = request.params.userId;
    let updateBy = 1; //request.userId;
    let {name, shopName, email, mobileNumber, gstNumber, foodLicense, area} = request.body;
    let avatar;
    if (request.files) {
        avatar = request.files.shopImage[0].path;
    }

    UserAuth.findOne({where: {VendorId: updateBy}}).then(requestUser => {
        if (!requestUser) {
            let error = new Error("Unauthorized access");
            error.statusCode = 401;
            throw error;
        }
        Connection.transaction(async (trans) => {
            return Vendor.findByPk(userId, {
                include: [{model: UserAuth}]
            }).then(user => {
                if (!user) {
                    let error = new Error("User Not Found");
                    error.statusCode = 404;
                    throw error;
                }
                let updateObject = {columns: [], values: []};
                if (user.updateOnColumn != null && user.updateOnColumn !== "") {
                    updateObject = JSON.parse(user.updateOnColumn);
                }
                user.name = name;
                user.email = email;
                if (user.mobileNumber !== mobileNumber) {
                    if (updateObject.columns.findIndex(i => i === 'mobileNumber') === -1) {
                        updateObject.columns.push('mobileNumber');
                        updateObject.values.push(mobileNumber);
                    }
                }
                if (user.shopName !== shopName) {
                    if (updateObject.columns.findIndex(i => i === 'shopName') === -1) {
                        updateObject.columns.push('shopName');
                        updateObject.values.push(shopName);
                    }
                }
                if (user.gstNumber !== gstNumber) {
                    if (updateObject.columns.findIndex(i => i === 'gstNumber') === -1) {
                        updateObject.columns.push('gstNumber');
                        updateObject.values.push(gstNumber);
                    }
                }
                if (user.foodLicense !== foodLicense) {
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
                    clearImage(user.avatar);
                    user.avatar = avatar;
                }
                if (updateObject.columns.length > 0) {
                    user.adminConfirmOn = 0;
                    user.updateOnColumn = JSON.stringify(updateObject);
                }

                user.updateBy = requestUser.id;
                return user.save({transaction: trans});
            }).then(user => {
                if (user.UserAuth.mobileNumber !== mobileNumber) {
                    user.UserAuth.mobileNumber = mobileNumber
                }
                return user.UserAuth.save({transaction: trans})
            }).catch(error => {
                throw error;
            })
        }).then(result => {
            response.status(200).json({
                status: 200,
                body: "Vendor create successfully!"
            })
        }).catch(error => {
            if (avatar) clearImage(avatar);
            next(error);
        })
    }).catch(error => {
        next(error);
    })

}


exports.deleteVendor = (request, response, next) => {

    let userId = request.params.vendorId;

    UserAuth.findOne({where: {VendorId: userId}}).then(user => {
        if (!user) {
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw error;
        }
        clearImage(user.avatar);
        return Vendor.destroy({
            where: {
                id: userId
            }
        })
    }).then(count => {
        if (!count) {
            let error = new Error("Failed to delete vendor")
            error.statusCode = 500;
            throw error;
        }
        response.status(200).json({
            body: "Successfully delete user"
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

exports.getAllVendorsTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];
    Vendor.count().then(totalCount => {
        Vendor.findAll({
            attributes: ["id", "name", "email", "mobileNumber", "gstNumber", "foodLicense",
                "avatar", "accountStatus", "createdAt"],
            include: [{model: UserAuth, attributes: ["id"]},{model:Location,as:"VendorLocations"}],
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

exports.getAllVendorOptions = (request, response, next) => {

    Vendor.findAll({
        attributes: ["id", ["name", "text"]]
    })
        .then(vendors => {
            response.status(200).json({
                results: [{id: -1, text: "", selected: true, disabled: true}, ...vendors]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}
