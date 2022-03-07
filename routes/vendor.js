const express = require("express");
const router = express.Router();
const vendorcontroller = require("../controller/VendorController");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
/* GET users listing. */
router.post(
  "/register_vendor",
  Validator(Schemas.vendorRegistration),
  vendorcontroller.register_vendor
);
router.post(
  "/login_vendor",
  Validator(Schemas.loginValidation),
  vendorcontroller.login_vendor
);

module.exports = router;
