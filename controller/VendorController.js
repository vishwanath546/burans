const {Connection} = require("../model/Database");
const {Vendor} = require("../model/Vendor");
const bcrypt = require("bcryptjs");
// const nodemailer = require("nodemailer");

exports.login_vendor = async (request, response) => {
    var {username: email, password} = request.body;
    Vendor.findOne({
        where: {email},
    })
        .then((vendordata) => {
            console.log(vendordata);
            if (!vendordata) {
                return response.status(200).json({
                    status: 201,
                    body: "User Not Found",
                });
            }
            return vendordata;
        })
        .then((vendordata) => {
            bcrypt
                .compare(password, vendordata.password)
                .then(async (isMatch) => {
                    if (isMatch) {
                        response.status(200).json({
                            status: 200,
                            body: await Vendor.findByPk(vendordata.id),
                        });
                    } else {
                        response.status(200).json({
                            status: 201,
                            body: "incorrect password",
                        });
                    }
                })
                .catch((error) => {
                    response.status(200).json({
                        status: 202,
                        body: "Something went wrong",
                        error: error,
                    });
                });
        })
        .catch((error) => {
            response.status(200).json({
                status: 201,
                body: "Something went wrong",
                error: error,
            });
        });
};

exports.vendorRegistration = (request, response) => {
    let {name, shopName, mobileNumber, password, gstNumber, foodLicense, area, user_id} = request.body;
    Connection.transaction(async (trans) => {
        const hashPassword = await bcrypt.hash(password, 12);
        const newVendor = await Vendor.create({
            name: name,
            shopName: shopName,
            mobileNumber: mobileNumber,
            gstNumber: gstNumber,
            foodLicense: foodLicense,
            area: area
        }, {transaction: trans});
        await newVendor.createUserAuth({
            userType: 2,
            mobileNumber: mobileNumber,
            password: hashPassword,
        }, {transaction: trans});
    }).then((result) => {

        res.status(200).json({
            status: 200,
            body: "Vendor Register successfully!",
        });
    })
        .catch((error) => {
            console.error(error);
            res.status(200).json({
                status: 201,
                body: error,
            });
        });
};
