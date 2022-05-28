require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("../../model/db");
const tableName = 'user_auth';
const userTable = 'users';

exports.signUp = (request, response, next) => {

    let {name, mobileNumber, password} = request.body;

    database.select(tableName, {mobileNumber: mobileNumber, userType: 1},
        ["id", "password", "AdminUserId", "userType", "rememberToken"])
        .then(User => {
            if (User.length > 0) {
                let error = new Error('Username already exists');
                error.statusCode = 409;
                throw error;
            } else {
                return bcrypt.hash(password, 12);
            }
        })
        .then(async hashPassword => {
            try {
                const UserObject = {
                    name: name,
                    verified: 0,
                    mobileNumber: mobileNumber,
                    createdAt: database.currentTimeStamp()
                }
                const connection = await database.transaction();
                await connection.beginTransaction();
                const [result, error] = await connection.query("insert into ?? set ?", [userTable, UserObject]);
                if (error) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed to register");
                }
                const adminAuthUserObject = {
                    userType: 1,
                    mobileNumber: mobileNumber,
                    password: hashPassword,
                    UserId: result.insertId,
                    otpToken: Math.floor(1000 + Math.random() * 9000),
                    createdAt: database.currentTimeStamp()
                }
                const [authResult, authError] = await connection.query("insert into ?? set ?", [tableName, adminAuthUserObject]);
                if (authError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed to register");
                }
                await connection.commit();
                connection.release()
                response.status(200).json({
                    body: "Registration of user successfully",
                    data: result.insertId
                })
            } catch (error) {
                next(error);
            }
        })
        .catch(error => {
            next(error);
        });

}

exports.otpVerification = (request, response, next) => {
    const {mobileNumber, otp} = request.body;
    database
        .query("select UserId from ?? where activeStatus=1 and mobileNumber=? and otpToken=? and otpExpiredAt < ?",
            [tableName, mobileNumber, otp, database.currentTimeStamp()]
        )
        .then(user => {
            if (user.length === 0) {
                let error = new Error("Invalid user or Otp");
                error.statusCode = 401;
                throw error;
            }
            return user[0];
        })
        .then(userAuth => {
            return database
                .select(userTable, {id: userAuth[0].UserId})

        })
        .then(user => {
            if (user.length === 0) {
                let error = new Error("User Not Found");
                error.statusCode = 404;
                throw error;
            }
            return user[0];
        })
        .then(async user => {
            request.session.user = {
                authId: user.id,
                mobileNumber: user.mobileNumber,
                email: user.email,
                avatar: user.avatar,
                gender: user.gender
            };
            let UserAuthObject = {
                loginAt: database.currentTimeStamp(),
            };
            let UserVerifyObject = {
                verified: 1,
                emailVerifiedAt: database.currentTimeStamp(),
            };
            try {

                const connection = await database.transaction();
                await connection.beginTransaction();
                const [result, error] = await connection.query("update ?? set ? where ?",
                    [userTable, UserVerifyObject, {id: user.id}]);
                if (error) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed to register");
                }

                const [authResult, authError] = await connection.query("update ?? set ? where ?",
                    [tableName, UserAuthObject, {UserId: user.id}]);
                if (authError) {
                    await connection.rollback();
                    connection.release();
                    throw new Error("Failed to register");
                }
                await connection.commit();
                connection.release()
                response.status(200).json({
                    body: "Verify Successfully"
                })
            } catch (error) {
                next(error);
            }
        })
        .catch((error) => {
            next(error);
        });
};

exports.mobileVerification = (request, response, next) => {

    let {mobileNumber} = request.body;

    database.select(tableName, {mobileNumber: mobileNumber, userType: 1},
        ["id", "UserId", "userType"])
        .then(User => {
            if (User.length === 0) {
                let error = new Error('Mobile number not register with us');
                error.statusCode = 404;
                throw error;
            } else {
                let OTP = Math.floor(1000 + Math.random() * 9000);
                database.update(tableName, {otpToken: OTP}, {id: User[0].id})
                    .then(resultObject => {
                        if (!resultObject) {
                            throw new Error('Failed To Send OTP');
                        } else {
                            response.status(200).json({
                                id:User[0].UserId,
                                type:User[0].userType
                            });
                        }
                    })
                    .catch(error => {
                        next(error)
                    })
            }
        })
        .catch(error => {
            next(error)
        })

}
