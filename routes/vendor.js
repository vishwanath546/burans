const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const vendorController = require("../controller/VendorController");
const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");
/* GET users listing. */
router.post(
  "/saveVendorDetails",
  Validator(Schemas.vendorRegistration),
  vendorController.vendorRegistration
);
router.post(
  "/login_vendor",
  Validator(Schemas.loginVendorValidation),
  vendorController.login_vendor
);
router.post(
  "/otpVerification",
  Validator(Schemas.otpVerification),
  vendorController.otpVerification
);
router.post(
  "/saveUpdateVendorDetails/:userId",
  Validator(Schemas.vendorRegistration),
  vendorController.vendorUpdate
);
router.post("/vendorApprovalConfirmation", vendorController.approval);
router.post("/getAllVendors", vendorController.getAllVendorsTables);

router.post("/getAllVendorOptions", vendorController.getAllVendorOptions);

router.post("/getVendorDetails", vendorController.getVendor);

router.delete("/deleteVendor/:vendorId", vendorController.deleteVendor);

module.exports = router;
