const express = require("express");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
const UserController = require('../controller/client/UserController');
const Homecontroller = require("../controller/client/HomeController");

Router.get("/signUp", function (req, res, next) {
    res.render("client/pages/signUp", { title: "Sign Up", url: req.url });
});

Router.get("/otpVerification", function (req, res, next) {
    res.render("client/pages/otpVerification", { title: "OTP Verification", url: req.url });
});

Router.post("/signUp",UserController.signUp);
Router.get("/home", function (req, res, next) {
    res.render("client/pages/Home", { title: "Home", url: req.url });
});

Router.get("/product", function (req, res, next) {
    res.render("client/pages/product", { title: "Product", url: req.url });
});
Router.get("/getCategory", Homecontroller.getCategory);
Router.post("/getSubCategory", Homecontroller.getSubCategory);
Router.post("/getSubCategoryProduct", Homecontroller.getSubCategoryProduct);

module.exports = Router;
