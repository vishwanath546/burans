require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const database = require('../model/db');
const tableName = 'user_auth';
const adminTable = 'admin_user';
const {clearImage} = require('../util/helpers');


exports.loginVerification = (request, response, next) => {
    let {username, password} = request.body;

    database.select(tableName, {mobileNumber: username, userType: 4},
        ["id", "password", "AdminUserId", "userType", "rememberToken"])
        .then(User => {
            if (User.length === 0) {
                let error = new Error('User Not Found');
                error.statusCode = 404;
                throw error;
            } else {
                return bcrypt.compare(password, User[0].password)
                    .then(async isMatch => {
                        if (isMatch) {
                            let token = jwt.sign({
                                username: username,
                                userId: User[0].AdminUserId
                            }, process.env.JWT_SECRET, {expiresIn: '1h'})
                            return database.update(tableName, {
                                loginAt: Date.now(),
                                rememberToken: token
                            }, {id: User[0].id})
                                .then(result => {
                                    if (!result.status) {
                                        let error = new Error('incorrect password');
                                        error.statusCode = 401;
                                        throw error;
                                    }
                                    return database.select(adminTable, {id: User[0].AdminUserId},
                                        ["id", "name", "email", "mobileNumber", "avatar"])
                                })
                                .then(adminUser => {
                                    if (adminUser.length === 0) {
                                        let error = new Error('User Not Found');
                                        error.statusCode = 404;
                                        throw error;
                                    }
                                    request.session.token = token;
                                    request.session.user = {
                                        userType: User[0].userType,
                                        authId: User[0].id, ...adminUser[0]
                                    };
                                    console.log("login session",request.session);
                                    return Promise.resolve(true);
                                })
                                .catch(error => {
                                    next(error);
                                });
                        } else {
                            let error = new Error('incorrect password');
                            error.statusCode = 401;
                            throw error;

                        }
                    }).then(result => {
                        response.status(200).json({
                            body: "Authenticated User"
                        })
                    })
                    .catch(error => {
                        next(error);
                    });
            }
        })
        .catch(error => {
            next(error);
        });
}

exports.updateAdmin = (request, response, next) => {
    let userId = request.params.userId;
    let updateBy = request.session.id;
    let {name, email, mobileNumber, setting} = request.body;
    let avatar;
    if (request.files) {
        avatar = request.files.profileImage[0].path;
    }

    try {
        database.select(tableName, {AdminUserId: userId, activeStatus: 1, userType: 4},
            ["id", "mobileNumber"])
            .then(async AuthUser => {
                if (AuthUser.length === 0) {
                    let error = new Error("Unauthorized access");
                    error.statusCode = 401;
                    throw error;
                }

                const connection = await database.transaction();
                await connection.beginTransaction();
                let user = {};
                user.name = name;
                user.email = email;
                user.mobileNumber = mobileNumber;
                user.settings = setting;
                user.updateBy = updateBy;
                user.updatedAt = database.currentTimeStamp();
                if (user.avatar !== avatar) {
                    clearImage(user.avatar);
                    user.avatar = avatar;
                }

                const [result, error] = await connection.query("update ?? set ? where ?", [adminTable, user, {id: userId}]);
                if (error) {
                    await connection.rollback();
                    connection.release();
                    let error = new Error("Failed to update");
                    error.statusCode = 401;
                    throw error;
                }
                let authUserObject = {
                    updatedAt: database.currentTimeStamp()

                };
                if (AuthUser[0].mobileNumber !== mobileNumber) {
                    authUserObject.mobileNumber = mobileNumber;
                }
                const [authResult, AuthError] = await connection.query("update ?? set ? where ?",
                    [tableName, authUserObject, {AdminUserId: userId, activeStatus: 1, userType: 4}]);
                if (AuthError) {
                    await connection.rollback();
                    connection.release();
                    let error = new Error("Failed to update");
                    error.statusCode = 401;
                    throw error;
                }
                await connection.commit();
                connection.release()
                response.status(200).json({
                    body: "Update admin user successfully"
                })
            })
            .catch(error => {
                next(error);
            })

    } catch (error) {
        next(error);
    }
}

exports.saveAdmin = async (request, response, next) => {
    let {name, email, mobileNumber, password} = request.body;
    if (!request.files) {
        return response.status(401).json({
            status: 401,
            body: "no image provided"
        })
    }
    const avatar = request.files.profileImage[0].path;
    try {
        const hashPassword = await bcrypt.hash(password, 12);
        const adminUserObject = {
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            settings: "1",
            avatar: avatar,
            createdAt: database.currentTimeStamp()
        }
        const connection = await database.transaction();
        await connection.beginTransaction();

        const [result, error] = await connection.query("insert into ?? set ?", [adminTable, adminUserObject]);
        if (error) {
            await connection.rollback();
            connection.release();
            let error = new Error("Failed to create admin user");
            error.statusCode = 401;
            throw error;
        }

        const adminAuthUserObject = {
            userType: 4,
            mobileNumber: mobileNumber,
            password: hashPassword,
            AdminUserId: result.insertId,
            createdAt: database.currentTimeStamp()
        }
        const [authResult, authError] = await connection.query("insert into ?? set ?", [tableName, adminAuthUserObject]);
        if (authError) {
            await connection.rollback();
            connection.release();
            let error = new Error("Failed to create admin user");
            error.statusCode = 401;
            throw error;
        }
        await connection.commit();
        connection.release()
        response.status(200).json({
            body: "Create admin user successfully"
        })
    } catch (error) {
        next(error);
    }
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
        return response.status(500).json({
            body: error
        })
    })
}


exports.getUser = (request, response) => {
    let userId = request.params.userId;
    AdminUser.findByPk(userId, {
        attributes: ["id", "name", "email", "mobileNumber", "avatar", "status"],
        include: [{
            model: UserAuth,
            attributes: ["userType", "loginAt"]
        }]
    }).then(user => {
        if (!user) {
            return response.status(404).json({
                body: "User Not Found"
            })
        }
        return response.status(200).json(user);
    }).catch(error => {
        return response.status(500).json({
            body: error.message
        })
    })
}
