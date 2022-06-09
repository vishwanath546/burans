const express = require("express");
const fs = require("fs");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const { check_session } = require("../middleware/check-session");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
const UserController = require("../controller/client/UserController");
const Homecontroller = require("../controller/client/HomeController");
const GoogleController = require("../controller/client/GoogleController");

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
Router.get("/profile", check_session, function (req, res) {
  res.render("client/pages/profile", {
    title: "Profile",
    url: req.url,
    screenTitle: "Profile",
    cartCount: 0,
  });
});

Router.get("/profileUpdate/:userId", check_session, function (req, res, next) {
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
});

Router.get("/payment", check_session, function (req, res) {
  res.render("client/pages/payment", {
    title: "Payment",
    url: req.url,
    screenTitle: "Payment",
    cartCount: 0,
  });
});
Router.post("/redirectpayment", check_session, Homecontroller.redirectpayment);

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
Router.post("/otpVerification", UserController.otpVerification);
Router.post("/signUp", UserController.signUp);
Router.get("/logout", UserController.logout);
Router.get("/home", function (req, res, next) {
  res.render("client/pages/Home", { title: "Home", url: req.url });
});

Router.get("/product", function (req, res, next) {
  res.render("client/pages/product", { title: "Product", url: req.url });
});
Router.get("/getCategory", Homecontroller.getCategory);

Router.post("/getSubCategory", Homecontroller.getSubCategory);
Router.post("/getSubCategoryProduct", Homecontroller.getSubCategoryProduct);
Router.post("/add_to_cart", check_session, Homecontroller.add_to_cart);
Router.post("/getCartList", check_session, Homecontroller.getCartList);
Router.post("/addtowishlist", check_session, Homecontroller.addtowishlist);
Router.post("/getwishList", check_session, Homecontroller.getwishList);
Router.post(
  "/delete_product_from_cart",
  check_session,
  Homecontroller.delete_product_from_cart
);
Router.post("/insertOrder", check_session, Homecontroller.insertOrder);

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
Router.post("/insert_address", check_session, Homecontroller.insert_address);
Router.post("/update_address", check_session, Homecontroller.update_address);
Router.post("/view_address", check_session, Homecontroller.view_address);
Router.post("/delete_address", check_session, Homecontroller.delete_address);

//Google Calender
Router.get("/loginGoogleCalender", function (req, res, next) {
  if (fs.existsSync("./token.json")) {
    fs.unlinkSync("./token.json");
  }

  res.render("client/pages/loginGoogleCalender", {
    title: "loginGoogleCalender",
    url: req.url,
  });
});
Router.get("/googleCalender", GoogleController.googleCalender);
Router.post("/get_events", GoogleController.get_events);
Router.post("/insert_events", GoogleController.insert_events);
module.exports = Router;
