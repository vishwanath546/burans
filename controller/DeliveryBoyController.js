const {Connection} = require("../model/Database");
const {DeliveryBoy} = require("../model/DeliveryBoy");
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

exports.login_vendor =  (request, response, next) => {
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
            accountStatus:2,
            area: area,
            avatar: avatar,
        }, {transaction: trans});
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
    let updateBy =1; //request.userId;
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
                if (user.updateOnColumn != null && user.updateOnColumn !=="") {
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


exports.deleteDeliveryBoy = (request, response,next) => {

    let userId = request.body.deliveryBoyId;

    UserAuth.findOne({ where :{DeliveryBoyId:userId}}).then(user => {
        if (!user) {
            let error = new Error("User Not Found");
            error.statusCode =404;
            throw error;
        }
        clearImage(user.avatar);
        return DeliveryBoy.destroy({
            where: {
                id: userId
            }
        })
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


exports.getVendor=(request,response,next)=>{
    let userId = request.body.vendorId;
    Vendor.findByPk(userId,{
        attributes:["id","name","email","mobileNumber","avatar","shopName","gstNumber","foodLicense",
            "area","accountStatus"],
        include:[{
            model:UserAuth,
            attributes:["userType","loginAt"]
        }]
    }).then(user=>{
        if(!user){
            let error = new Error("User Not Found")
            error.statusCode = 404;
            throw error;
        }
        return response.status(200).json(user);
    }).catch(error=>{
        next(error)
    })
}

exports.getAllDeliveryBoyTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];
    DeliveryBoy.count().then(totalCount => {
        DeliveryBoy.findAll({
            attributes: ["id", "name", "email", "area","mobileNumber","license","bikeRc",
                "photo",
                "area", "createdAt"],
            include:[{model:UserAuth,attributes:["id"]}],
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
