const database = require('../model/db');

const {clearImage} = require('../util/helpers');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const vendorTable = 'vendor_user';
const userAuthTable = 'user_auth';
const vendorLocationTable ="vendor_locations";

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

exports.vendorRegistration = async (request, response, next) => {
    let {name, shopName, email, mobileNumber, gstNumber, foodLicense, area} = request.body;


    if (!request.files) {
        return response.status(401).json({
            status: 401,
            body: "no image provided"
        })
    }
    const avatar = request.files.shopImage[0].path;

    try {
        const connection = await database.transaction();
        await connection.beginTransaction();
        const [vendorResult, error] = await connection.query("insert into ?? set ?", [vendorTable, {
            name: name,
            shopName: shopName,
            mobileNumber: mobileNumber,
            gstNumber: gstNumber,
            email: email,
            foodLicense: foodLicense,
            accountStatus: 1,
            avatar: avatar,
            createdAt:database.currentTimeStamp()
        }]);
        if (error) {
            await connection.rollback();
            connection.release()
            throw new Error("Failed To Create Vendor");
        }
        const hashPassword = await bcrypt.hash("123456", 12);
        const [authUserResult, authError] = await connection.query("insert into ?? set ?", [userAuthTable, {
            userType: 2,
            mobileNumber: mobileNumber,
            password: hashPassword,
            VendorId: vendorResult.insertId,
            createdAt:database.currentTimeStamp()
        }])

        if(area){
            let allAreas=area.map(a=> {
                return connection.query("insert into ?? set ?", [vendorLocationTable,
                    {locationId: a, vendorId: vendorResult.insertId}
                ]);
            });
            Promise.all(allAreas).then(async (areaResult,areaError)=>{
                if (areaError) {
                    await connection.rollback();
                    throw new Error("Failed To Create Vendor Areas");
                }
                await connection.commit();
                connection.release()
                response.status(200).json({
                    body: "Create Category Successfully"
                })
            })

        }else{
            if (authError || !authUserResult.status) {
                await connection.rollback();
                connection.release()
                throw new Error("Failed To Create Vendor auth");
            }
            await connection.commit();
            connection.release()
            response.status(200).json({
                body: "Create Category Successfully"
            })
        }


    } catch (e) {
        next(e)
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


    try{
        const connection = await database.transaction();
        await connection.beginTransaction();
        const [vendors]=await connection.query(`select *,
       (select group_concat(locationId) from vendor_locations where vendorId=vendor_user.id) as mapAreas,
       (select mobileNumber from user_auth where VendorId=vendor_user.id) as user_mobileNumber
                                            from vendor_user where id=?`,[userId]);
        if(vendors.length===0){
            connection.release()
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw error;
        }
        let vendor = vendors[0];
        let updateObject = {columns: [], values: []};
        if (vendor.updateOnColumn != null && vendor.updateOnColumn !== "") {
            updateObject = JSON.parse(vendor.updateOnColumn);
        }
        let vendorObject = {};
        vendorObject.name = name;
        vendorObject.email = email;
        if (vendor.mobileNumber !== mobileNumber) {
            if (updateObject.columns.findIndex(i => i === 'mobileNumber') === -1) {
                updateObject.columns.push('mobileNumber');
                updateObject.values.push(mobileNumber);
            }
        }
        if (vendor.shopName !== shopName) {
            if (updateObject.columns.findIndex(i => i === 'shopName') === -1) {
                updateObject.columns.push('shopName');
                updateObject.values.push(shopName);
            }
        }
        if (vendor.gstNumber !== gstNumber) {
            if (updateObject.columns.findIndex(i => i === 'gstNumber') === -1) {
                updateObject.columns.push('gstNumber');
                updateObject.values.push(gstNumber);
            }
        }
        if (vendor.foodLicense !== foodLicense) {
            if (updateObject.columns.findIndex(i => i === 'foodLicense') === -1) {
                updateObject.columns.push('foodLicense');
                updateObject.values.push(foodLicense);
            }
        }
        if (vendor.mapAreas !== area.join(",")) {
            if (updateObject.columns.findIndex(i => i === 'area') === -1) {
                updateObject.columns.push('area');
                updateObject.values.push(area);
            }
        }
        if (avatar) {
            vendorObject.avatar = avatar;
        }
        if (updateObject.columns.length > 0) {
            vendorObject.adminConfirmOn = 0;
            vendorObject.updateOnColumn = JSON.stringify(updateObject);
        }
        const [result,vendorUpdateError]= await connection.query('update ?? set ? where ?',[vendorTable,vendorObject,{id:userId}]);
        if(vendorUpdateError){
            await connection.rollback();
            connection.release();
            throw new Error("Failed To Create Vendor");
        }

        if (vendor.user_mobileNumber !== mobileNumber) {
          const [userAuthResult,userAuthError]=await connection.query("update ?? set ? where ?",[userAuthTable,{mobileNumber:mobileNumber},{VendorId:userId}])
            if(userAuthError){
                await connection.rollback();
                connection.release();
                throw new Error("Failed To Update Vendor ");
            }
        }
        await connection.commit();
        if (avatar) {
            vendorObject.avatar = avatar;
        }
        connection.release()
        response.status(200).json({
            body: "Create Category Successfully"
        })
    }catch (error) {
        console.log(error)
        next(error);
    }
}


exports.deleteVendor = (request, response, next) => {

    let userId = request.params.vendorId;

    database.select(vendorTable,{id:userId})
        .then(user => {
        if (user.length===0) {
            let error = new Error("User Not Found");
            error.statusCode = 404;
            throw error;
        }
        clearImage(user[0].avatar);
        return database.update(vendorTable,{activeStatus:0,deletedAt:database.currentTimeStamp()},{id:userId});
    }).then(result => {
        if (!result.status) {
            let error = new Error("Failed to delete vendor")
            error.statusCode = 500;
            throw error;
        }
        return database.update(userAuthTable,{activeStatus:0,deletedAt:database.currentTimeStamp()},{VendorId:userId});

    }).then(result=>{
        if (!result.status) {
            let error = new Error("Failed to delete vendor")
            error.statusCode = 500;
            throw error;
        }
        response.status(200).json({
            body: "Successfully delete vendor"
        })
    })
        .catch(error => {
        next(error)
    })
}


exports.getVendor = (request, response, next) => {
    let userId = request.body.vendorId;
    database.select(vendorTable, {id:userId},
        ["id", "name", "email", "mobileNumber", "avatar", "shopName", "gstNumber", "foodLicense",
            "updateOnColumn","adminConfirmOn","accountStatus",
            "(select group_concat(locationId) from vendor_locations where vendorId=vendor_user.id) as area",
            "accountStatus"]).then(user => {
        if (user.length ===0) {
            let error = new Error("User Not Found")
            error.statusCode = 404;
            throw error;
        }
        return response.status(200).json(user[0]);
    }).catch(error => {
        next(error)
    })
}

exports.getAllVendorsTables = (request, response, next) => {
    let {start, length, draw} = request.body;
    let search = request.body['search[value]'];

    database.findAllCount(vendorTable, {activeStatus: 1})
        .then(totalCount => {
            database.dataTableSource(vendorTable, ["id", "name", "email", "mobileNumber", "gstNumber", "foodLicense",
                    "avatar", "accountStatus", "createdAt","adminConfirmOn",
                    "(select group_concat(name) from location where id in(select locationId from vendor_locations where vendorId=vendor_user.id)) as area"],
                {activeStatus: 1},
                'createdAt', 'name', search, "desc", parseInt(start), parseInt(length),false)
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
}

exports.getAllVendorOptions = (request, response, next) => {

    database.select(vendorTable,{activeStatus:1},["id","shopName as text"])
        .then(vendors => {
            response.status(200).json({
                results: [{id: -1, text: "",  disabled: true}, ...vendors]
            });
        }).catch(error => {
        response.status(500).json({
            body: error.message
        })
    })
}
