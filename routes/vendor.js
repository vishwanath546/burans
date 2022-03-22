const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/is-auth')
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
router.put("/update-vendor/:userId",
    isAuth,
    Validator(Schemas.adminUpdate),
    vendorController.vendorUpdate);

module.exports = router;
