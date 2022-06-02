const express = require("express");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
const UserController = require("../controller/client/UserController");
const Homecontroller = require("../controller/client/HomeController");

Router.get("/", function (req, res) {
  res.render("client/pages/index", { title: "Burans", url: req.url });
});

Router.get("/login", function (req, res) {
  res.render("client/pages/login", { title: "login", url: req.url });
});

Router.post("/loginVerification", UserController.mobileVerification);

Router.get("/signUp", function (req, res) {
  res.render("client/pages/signUp", { title: "Sign Up", url: req.url });
});
Router.get("/introduction", function (req, res) {
  res.render("client/pages/introduction", {
    title: "Introduction",
    url: req.url,
  });
});
Router.get("/location", function (req, res) {
  res.render("client/pages/location", { title: "Location", url: req.url });
});
Router.get("/locationSelection", function (req, res) {
  res.render("client/pages/locationSelection", {
    title: "Location",
    url: req.url,
  });
});
Router.get("/profile", function (req, res) {
  res.render("client/pages/profile", {
    title: "Profile",
    url: req.url,
    screenTitle: "Profile",
    cartCount: 0,
  });
});

Router.get("/profileUpdate/:userId",function (req,res,next) {
    let userId = req.params.userId;
    if (!userId) {
        let error = new Error("Not Found");
        error.statusCode = 404;
        next(error);
    }
    let segments = req.url.split("/");
    res.render("client/pages/profileEdit", {
        title: "Profile update",
        session: req.session,
        screenTitle: "Update Profile",
        cartCount: 0,
        userId: userId,
        url: "/" + segments[1],
    });
})

Router.get("/payment", function (req, res) {
  res.render("client/pages/payment", {
    title: "Payment",
    url: req.url,
    screenTitle: "Payment",
    cartCount: 0,
  });
});

Router.get("/otp/:userId", function (req, res, next) {
    let userId = req.params.userId;
    if (!userId) {
        let error = new Error("Not Found");
        error.statusCode = 404;
        next(error);
    }
    let segments = req.url.split("/");
    res.render("client/pages/otpVerification", {
        title: "OTP Verification",
        session: req.session,
        userId: userId,
        url: "/" + segments[1],
    });
});
Router.post("/otpVerification",UserController.otpVerification);

Router.post("/signUp", UserController.signUp);

Router.get("/home", function (req, res, next) {
  res.render("client/pages/Home", { title: "Home", url: req.url });
});

Router.get("/product", function (req, res, next) {
  res.render("client/pages/product", { title: "Product", url: req.url });
});
Router.get("/getCategory", Homecontroller.getCategory);
Router.post("/getSubCategory", Homecontroller.getSubCategory);
Router.post("/getSubCategoryProduct", Homecontroller.getSubCategoryProduct);
Router.post("/add_to_cart", Homecontroller.add_to_cart);
Router.post("/getCartList", Homecontroller.getCartList);
Router.post("/addtowishlist", Homecontroller.addtowishlist);
Router.post("/getwishList", Homecontroller.getwishList);
Router.post(
  "/delete_product_from_cart",
  Homecontroller.delete_product_from_cart
);
Router.post("/insertOrder", Homecontroller.insertOrder);

Router.get("/home", function (req, res, next) {
  console.log(req.url);
  res.render("client/pages/Home", { title: "Home", url: req.url });
});
Router.get("/product", function (req, res, next) {
  res.render("client/pages/product", { title: "Product", url: req.url });
});
Router.get("/checkout", function (req, res, next) {
  res.render("client/pages/checkout", { title: "checkout", url: req.url });
});
Router.get("/wishlist", function (req, res, next) {
  res.render("client/pages/wishlist", { title: "wishlist", url: req.url });
});
Router.post("/insert_address", Homecontroller.insert_address);
Router.post("/update_address", Homecontroller.update_address);
Router.post("/view_address", Homecontroller.view_address);
Router.post("/delete_address", Homecontroller.delete_address);

module.exports = Router;
