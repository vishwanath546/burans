require('dotenv').config();
const {clearImage} = require('../util/helpers');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const {Connection} = require('../sequlizerModel/Database');

const {AdminUser} = require('../sequlizerModel/AdminUser');
const {UserAuth} = require('../sequlizerModel/UserAuth');



exports.loginVerification = (request, response) => {
    let {username, password} = request.body;

    UserAuth.findOne({
        where: {mobileNumber: username, userType: 4}
    }).then(User => {
        if (!User) {
            response.status(401).json({
                body: "User Not Found"
            })
        } else {
            bcrypt.compare(password, User.password).then(async isMatch => {
                if (isMatch) {
                    User.loginAt = Date.now();
                    User.save({fields: ["loginAt"]});

                    let token = jwt.sign({
                        username: username,
                        userId: User.AdminUserId
                    }, process.env.JWT_SECRET, {expiresIn: '1h'})

                    response.status(200).json({
                        status: 200,
                        token: token,
                        body: await AdminUser.findByPk(User.AdminUserId, {
                            include: [{model: UserAuth, attributes: ["userType", "rememberToken"]}],
                            attributes: ["id", "name", "email", "mobileNumber", "avatar"]
                        })
                    })
                } else {
                    response.status(401).json({
                        body: "incorrect password"
                    })
                }
            }).catch(error => {
                response.status(200).json({
                    status: 201,
                    body: "Something went wrong",
                    error: error
                })
            })
        }
    }).catch(error => {
        response.status(200).json({
            status: 201,
            body: "Something went wrong",
            error: error
        })
    });
}

exports.updateAdmin = (request, response,next) => {
    let userId = request.params.userId;
    let updateBy = request.userId;
    let {name, email, mobileNumber, setting} = request.body;
    if (!request.files) {
        return response.status(401).json({
            status: 401,
            body: "no image provided"
        })
    }
    const avatar = request.files.profileImage[0].path;

    AdminUser.findByPk(updateBy).then(requestUser=>{
        if(!requestUser){
            let error=new Error("Unauthorized access");
            error.statusCode=401;
            throw error;
        }
        Connection.transaction(async (trans) => {
            return AdminUser.findByPk(userId,{
                include:[{model:UserAuth}]
            }).then(user => {
                if (!user) {
                    return response.status(404).json({
                        body: "User Not Found"
                    });
                }
                user.name = name;
                user.email = email;
                user.mobileNumber = mobileNumber;
                user.settings = setting;
                user.updateBy = requestUser.id;
                if (user.avatar !== avatar) {
                    clearImage(user.avatar);
                    user.avatar = avatar;
                }
                return user.save({transaction: trans});
            }).then(user => {
                if(user.UserAuth.mobileNumber !== mobileNumber) {
                    user.UserAuth.mobileNumber = mobileNumber
                }
                return user.UserAuth.save({transaction: trans})
            })
        }).then(result => {
            response.status(200).json({
                status: 200,
                body: "User create successfully!"
            })
        }).catch(error => {
            clearImage(avatar);
            error.statusCode=500;
            next(error);
        })
    }).catch(error=>{
        next(error);
    })
}

exports.saveAdmin = (request, response) => {
    let {name, email, mobileNumber, password} = request.body;
    Connection.transaction(async (trans) => {
        const hashPassword = await bcrypt.hash(password, 12);

        if (!request.files) {
            return response.status(401).json({
                status: 401,
                body: "no image provided"
            })
        }
        const avatar = request.files.profileImage[0].path;
        let AdminUserObject = await AdminUser.create({
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            settings: "1",
            avatar: avatar,
        }, {transaction: trans});

        await AdminUserObject.createUserAuth({
            userType: 4,
            mobileNumber: mobileNumber,
            password: hashPassword,
        }, {transaction: trans});
    }).then(() => {
        response.status(200).json({
            status: 200,
            body: "User Register successfully!"
        })
    }).catch(error => {
        response.status(500).json({
            status: 201,
            body: error
        })
    })

}

exports.deleteAdminUser = (request, response) => {

    let userId = request.params.userId;

    AdminUser.findByPk(userId).then(user => {
        if (!user) {
            return response.status(404).json({
                body: "User Not Found"
            })
        }
        clearImage(user.avatar);
        return AdminUser.destroy({
            where: {
                id: userId
            }
        })
    }).then(count => {
        if (!count) {
            return response.status(500).json({
                body: "Failed To delete user"
            })
        }
        return response.status(200).json({
            body: "Successfully delete user"
        })
    }).catch(error => {
       return  response.status(500).json({
            body: error
        })
    })
}


exports.getUser=(request,response)=>{
    let userId = request.params.userId;
    AdminUser.findByPk(userId,{
        attributes:["id","name","email","mobileNumber","avatar","status"],
        include:[{
            model:UserAuth,
            attributes:["userType","loginAt"]
        }]
    }).then(user=>{
        if(!user){
            return response.status(404).json({
                body:"User Not Found"
            })
        }
        return response.status(200).json(user);
    }).catch(error=>{
        return  response.status(500).json({
            body: error.message
        })
    })
}
