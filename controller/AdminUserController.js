const bcrypt = require('bcryptjs');
const Joi = require('joi');

const {Connection} = require('../model/Database');

const {AdminUser} = require('../model/AdminUser');
const {UserAuth} = require('../model/UserAuth');

exports.loginVerification = (request, response) => {
    let {username, password} = request.body;

    UserAuth.findOne({
        where: {mobileNumber: username, userType: 4}
    }).then(User => {
        if (!User) {
            return response.status(200).json({
                status: 201,
                body: "User Not Found"
            })
        }
        return User;
    }).then(User => {
        bcrypt.compare(password, User.password).then(async isMatch => {
            if (isMatch) {
                response.status(200).json({
                    status: 201,
                    body: await AdminUser.findByPk(User.AdminUserId)
                })
            } else {
                response.status(200).json({
                    status: 201,
                    body: "incorrect password"
                })
            }
        }).catch(error => {
            console.error(error)
            response.status(200).json({
                status: 202,
                body: "Something went wrong",
                error: error
            })
        });
    }).catch(error => {
        response.status(200).json({
            status: 201,
            body: "Something went wrong",
            error: error
        })
    });
}


exports.saveAdmin = (request, response) => {
    let {name, email, mobileNumber, password} = request.body;
    Connection.transaction(async (trans) => {
        const User = await AdminUser.create({
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            settings: "1"
        }, {transaction: trans});
        const hashPassword = await bcrypt.hash(password, 12);
        await User.createUserAuth({
            userType: 4,
            mobileNumber: mobileNumber,
            password: hashPassword,
        }, {transaction: trans});
    }).then(result => {
        response.status(200).json({
            status: 200,
            body: "User create successfully!"
        })
    }).catch(error => {
        console.error(error)
        response.status(200).json({
            status: 201,
            body: error
        })
    })

}
