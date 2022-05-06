const express = require("express");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");

const Homecontroller = require("../controller/client/HomeController");

Router.get("/getCategory", Homecontroller.getCategory);
Router.post("/getSubCategory", Homecontroller.getSubCategory);
Router.post("/getSubCategoryProduct", Homecontroller.getSubCategoryProduct);
Router.post("/add_to_cart", Homecontroller.add_to_cart);
Router.post("/getCartList", Homecontroller.getCartList);
Router.post("/addtowishlist", Homecontroller.addtowishlist);
Router.post("/getwishList", Homecontroller.getwishList);

module.exports = Router;
