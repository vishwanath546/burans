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

router.get("/",(request,response)=>{
   response.render("vendor/pages/index",{ title: "Vendor",
       url: request.url})
});

router.get("/login",(request,response)=>{
    response.render("vendor/pages/login",{ title: "Vendor Login",
        url: request.url})
});

router.get("/otp/:userId",(request,response)=>{
    let userId = request.params.userId;
    if (!userId) {
        let error = new Error("Not Found");
        error.statusCode = 404;
        next(error);
    }
    let segments = request.url.split("/");
    response.render("vendor/pages/otp", {
        title: "OTP Verification",
        session: request.session,
        userId: userId,
        url: "/" + segments[1],
    });
});

router.get("/profile-edit",(request,response,next)=>{
    // let userId = request.params.userId;
    // if (!userId) {
    //     let error = new Error("Not Found");
    //     error.statusCode = 404;
    //     next(error);
    // }
    let segments = request.url.split("/");
    response.render("vendor/pages/profile", {
        title: "Profile update",
        session: request.session,
        screenTitle: "Update Profile",
        cartCount: 0,
        url: "/" + segments[1],
    });
})

router.get("/products",(request,response,next)=>{
    response.render("vendor/pages/product",{ title: "Vendor products",
        screenTitle: "Update products",
        url: request.url})
})
router.get("/orders",(request,response,next)=>{
    response.render("vendor/pages/order",{ title: "Vendor Order",
        screenTitle: "Vendor Order",
        url: request.url})
})
module.exports = router;
