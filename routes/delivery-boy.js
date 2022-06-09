const express = require("express");
const Router = express.Router();

const DeliveryBoyController = require("../controller/DeliveryBoyController");

Router.get("/", function (req, res) {
    res.render("delivery-boy/pages/index", { title: "Burans Delivery Boy", url: req.url });
});

Router.get("/login", function (req, res) {
    res.render("delivery-boy/pages/login", { title: "login", url: req.url });
});

Router.post("/login", DeliveryBoyController.loginDeliveryBoy);


Router.get("/otp/:userId", function (req, res,next) {
    let userId = req.params.userId;
    if (!userId) {
        let error = new Error("Not Found");
        error.statusCode = 404;
        next(error);
    }
    let segments = req.url.split("/");
    res.render("delivery-boy/pages/otp", {
        title: "OTP",
        session: req.session,
        userId: userId,
        url: "/" + segments[1],
    });
});

Router.post("/otp/verification",DeliveryBoyController.otpDeliveryBoyVerification)

Router.get("/profile-edit", function (req, res) {
    res.render("delivery-boy/pages/profile", { title: "OTP", url: req.url });
});

Router.get("/orders", function (req, res) {
    res.render("delivery-boy/pages/profile", { title: "OTP", url: req.url });
});

module.exports = Router;
