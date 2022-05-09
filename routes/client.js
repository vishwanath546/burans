const express = require("express");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
const UserController = require('../controller/client/UserController');
const Homecontroller = require("../controller/client/HomeController");

Router.get("/login", function (req, res, next) {
    res.render("client/pages/login", {title: "login", url: req.url});
});


Router.get("/signUp", function (req, res, next) {
    res.render("client/pages/signUp", {title: "Sign Up", url: req.url});
});

Router.get("/otpVerification/:userId", function (req, res, next) {
    let userId = req.params.userId;
    if (!userId) {
        let error = new Error("Not Found");
        error.statusCode = 404;
        throw error;
    }
    let segments = req.url.split("/");
    res.render("client/pages/otpVerification",
        {
            title: "OTP Verification",
            session: req.session,
            userId: userId,
            url: "/" + segments[1],
        });
});

Router.post("/signUp", UserController.signUp);
Router.get("/home", function (req, res, next) {
    res.render("client/pages/Home", {title: "Home", url: req.url});
});

Router.get("/product", function (req, res, next) {
    res.render("client/pages/product", {title: "Product", url: req.url});
});
Router.get("/getCategory", Homecontroller.getCategory);
Router.post("/getSubCategory", Homecontroller.getSubCategory);
Router.post("/getSubCategoryProduct", Homecontroller.getSubCategoryProduct);
Router.post("/add_to_cart", Homecontroller.add_to_cart);
Router.post("/getCartList", Homecontroller.getCartList);
Router.post("/addtowishlist", Homecontroller.addtowishlist);
Router.post("/getwishList", Homecontroller.getwishList);

module.exports = Router;
