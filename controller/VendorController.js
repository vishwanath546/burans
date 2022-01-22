const { Connection } = require("../model/Database");
const { Vendor } = require("../model/Vendor");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

exports.login_vendor = async (request, response, next) => {
  var { username: email, password } = request.body;
  Vendor.findOne({
    where: { email },
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

exports.register_vendor = (req, res, next) => {
  req.body.loginAt = new Date();
  Connection.transaction(async (trans) => {
    req.body.password = await bcrypt.hash(req.body.password, 12);
    const vendor_data = await Vendor.create(req.body, {
      transaction: trans,
    });
  })
    .then((result) => {
      //   let transport = nodemailer.createTransport({
      //     service: "gmail",
      //     auth: {
      //       user: "vnathn1253@gmail.com",
      //       pass: "Vnathn04080901@",
      //     },
      //   });
      //   const mailOptions = {
      //     from: "vnathn1253@gmail.com", // Sender address
      //     to: "vnathn.fyntune@gmail.com", // List of recipients
      //     subject: "Node Mailer", // Subject line
      //     text: "Hello People!, Welcome to Bacancy!", // Plain text body
      //   };

      //   transport.sendMail(mailOptions, function (err, info) {
      //     if (err) {
      //       console.log(err);
      //     } else {
      //       console.log(info);
      //     }
      //   });
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
