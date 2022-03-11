const express = require("express");
const router = express.Router();
const vendorController = require("../controller/VendorController");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
/* GET users listing. */
router.post(
  "/register_vendor",
  Validator(Schemas.vendorRegistration),
  vendorController.vendorRegistration
);
router.post(
  "/login_vendor",
  Validator(Schemas.loginValidation),
    vendorController.login_vendor
);

module.exports = router;
