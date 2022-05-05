const express = require("express");
const Router = express.Router();
const isAuth = require("../middleware/is-auth");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");

const Homecontroller = require("../controller/Homecontroller");

Router.get("/getCategory", Homecontroller.getCategory);

module.exports = Router;
