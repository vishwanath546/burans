const express = require("express");
const router = express.Router();

const CategoryController = require("../controller/CategoryController");
const LocationController = require("../controller/LocationController");
const ServiceController = require("../controller/ServiceController");
const ProductController = require("../controller/ProductController");
const DeliveryBoyController = require("../controller/DeliveryBoyController");
const AddOnsProductController = require("../controller/AddOnsProductController");
const OfferController = require("../controller/OfferController");

const Validator = require("../validator/Validation");
const Schemas = require("../validator/Schemas");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Burans Login" });
});

router.get("/dashboard", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  res.render("pages/dashboard", {
    title: "Dashboard",
    url: req.url,
    session: req.session,
  });
});

router.get("/customer", function (req, res, next) {
  res.render("pages/customer/view_customer", {
    title: "View customer",
    url: req.url,
    session: req.session,
  });
});
// ---------------------------- Category ---------------------------------
router.get("/categories", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/category", {
    title: "View product",
    url: req.url,
    session: req.session,
  });
});
router.get("/categoryRanking", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/CategoryRanking", {
    title: "Category Ranking",
    url: req.url,
    session: req.session,
  });
});
router.get("/create-categories", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/CategoryForm", {
    title: "Crate Category",
    url: req.url,
    categoryId: 0,
    session: req.session,
  });
});
router.get("/update-categories/:updateID", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  let categoryId = req.params.updateID;
  let segments = req.url.split("/");
  res.render("pages/product/CategoryForm", {
    title: "Update Category",
    url: "/" + segments[1],
    categoryId: categoryId,
    session: req.session,
  });
});
router.get("/getAllCategories", CategoryController.getAllCategories);
router.post("/getCategoryById", CategoryController.getCategoryById);
router.post(
  "/saveCategorySubcategory",
  Validator(Schemas.categoryValidation),
  CategoryController.saveCategorySubcategory
);
router.post(
  "/getAllCategoriesOptions",
  CategoryController.getAllCategoriesOption
);
router.post(
  "/getAllSubcategoriesOption/:categoryId",
  CategoryController.getAllSubcategoriesOption
);
router.post(
  "/getAllCategoriesTables",
  CategoryController.getAllCategoriesTables
);
router.post("/updateCategoryRanking", CategoryController.sequenceUpdate);
router.put("/updateCategoryStatus", CategoryController.updateCategoryStatus);
router.delete("/deleteCategory", CategoryController.deleteCategory);

// --------------------------- product --------------------------------------

router.get("/products", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/ViewProducts", {
    title: "View product",
    url: req.url,
    session: req.session,
  });
});

router.get("/productRanking", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/ProductRanking", {
    title: "Product Ranking",
    url: req.url,
    session: req.session,
  });
});

router.get("/create-product", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/ProductForm", {
    title: "Create Product",
    url: req.url,
    productId: 0,
    session: req.session,
  });
});

router.get("/update-product/:updateID", function (req, res) {
  if (!req.session.user) res.redirect("/");
  let productId = req.params.updateID;
  if (!productId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/product/ProductForm", {
    title: "Create Product",
    url: "/" + segments[1],
    productId: productId,
    session: req.session,
  });
});

router.post("/uploadProductsImages", ProductController.uploadProductsImages);
router.post(
  "/saveProductDetails",
  Validator(Schemas.productValidation),
  ProductController.saveProductDetails
);
router.post("/getProductById", ProductController.getProductById);
router.post("/getAllProductsTables", ProductController.getAllProductTables);
router.post("/getAllProducts", ProductController.getAllProduct);
router.post("/getAllProductsOptions", ProductController.getAllProductOption);
router.delete("/deleteProduct", ProductController.deleteProduct);
// -------------------------- Add ons products --------------------------------------

router.get("/add-ons-products", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/ViewAddOnsProduct", {
    title: "View add ons product",
    url: req.url,
    session: req.session,
  });
});
router.get("/create-add-ons-product", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/product/AddOnsProductForm", {
    title: "Create Product",
    url: req.url,
    addOnProductId: 0,
    session: req.session,
  });
});
router.get("/update-add-ons-product/:updateID", function (req, res) {
  if (!req.session.user) res.redirect("/");
  let productId = req.params.updateID;
  if (!productId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/product/AddOnsProductForm", {
    title: "Create Add Ons Product",
    url: "/" + segments[1],
    addOnProductId: productId,
    session: req.session,
  });
});

router.post(
  "/saveAddOnsProductDetails",
  AddOnsProductController.saveAddOnsProduct
);
router.post(
  "/getAllAddOnsProductsTables",
  AddOnsProductController.getAllOnsProductTables
);
router.post(
  "/getAllAddOnsProductsOptions",
  AddOnsProductController.getAllAddOnsProductOption
);
router.post("/getAddOnsProduct", AddOnsProductController.getAddOnsProductById);
router.delete(
  "/deleteAddOnsProduct",
  AddOnsProductController.deleteAddOnsProduct
);

// --------------------------- Location ------------------------------------------

router.get("/view-locations", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/location/ViewLocations", {
    title: "View Location",
    url: req.url,
    session: req.session,
  });
});
router.post("/saveLocation", LocationController.saveLocation);
router.post("/getAllLocationTables", LocationController.getAllLocationTables);
router.post("/getAllLocationOptions", LocationController.getAllLocationOption);
router.post("/getLocation", LocationController.getLocationById);
router.delete("/deleteLocation", LocationController.deleteLocation);
// ------------------------------ service ----------------------------------------

router.get("/serviceRanking", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/service/ServiceRanking", {
    title: "Service Ranking",
    url: req.url,
    session: req.session,
  });
});
router.get("/create-service", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/service/ServiceForm", {
    title: "Create Service",
    url: req.url,
    serviceId: 0,
    session: req.session,
  });
});
router.get("/update-service/:updateID", function (req, res) {
  if (!req.session.user) res.redirect("/");
  let serviceId = req.params.updateID;
  if (!serviceId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/service/ServiceForm", {
    title: "Update Service",
    url: "/" + segments[1],
    serviceId: serviceId,
    session: req.session,
  });
});
router.get("/view-service", function (req, res) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/Service/ViewServices", {
    title: "View Services",
    url: req.url,
    session: req.session,
  });
});
router.post("/saveService", ServiceController.saveServiceSubServices);
router.post("/getAllServiceTables", ServiceController.getAllServicesTables);
router.post("/getAllServiceOptions", ServiceController.getAllServiceOption);
router.post("/updateServiceRanking", ServiceController.sequenceUpdate);
router.get("/getAllService", ServiceController.getAllServices);
router.post("/getService", ServiceController.getServiceById);
router.delete("/deleteService", ServiceController.deleteService);

// --------------------------- vendor ------------------------------------------

router.get("/view-vendor", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/vendor/vendors", {
    title: "View vendor",
    url: req.url,
    session: req.session,
  });
});

router.get("/create-vendor", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/vendor/VendorForm", {
    title: "create vendor",
    url: req.url,
    vendorId: 0,
    session: req.session,
  });
});
router.get("/update-vendor/:updateId", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  let vendorId = req.params.updateId;
  if (!vendorId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/vendor/VendorForm", {
    title: "View product",
    url: "/" + segments[1],
    vendorId: vendorId,
    session: req.session,
  });
});

// ----------------- delivery boy -----------------------------------------------
router.get("/create-delivery-boy", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/DeliveryBoy/DeliveryBoy", {
    title: "Create Delivery Boys",
    url: req.url,
    deliveryBoyId: 0,
    session: req.session,
  });
});

router.get("/update-delivery-boy/:updateId", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  let deliveryBoyId = req.params.updateId;
  if (!deliveryBoyId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/DeliveryBoy/DeliveryBoy", {
    title: "Create Delivery Boys",
    url: "/" + segments[1],
    deliveryBoyId: deliveryBoyId,
    session: req.session,
  });
});

router.get("/view-delivery-boys", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  res.render("pages/DeliveryBoy/ViewDeliveryBoy", {
    title: "View Delivery Boys",
    session: req.session,
    url: req.url,
  });
});
router.post(
  "/getAllDeliveryBoysTables",
  DeliveryBoyController.getAllDeliveryBoyTables
);
router.post(
  "/saveDeliveryBoyDetails",
  DeliveryBoyController.DeliveryBoyRegistration
);
router.post("/getDeliveryBoy", DeliveryBoyController.getDeliveryBoy);
router.post(
  "/saveUpdateDeliveryDetails/:userId",
  DeliveryBoyController.deliveryBoyUpdate
);
router.post("/deliveryBoyApprovalConfirmation", DeliveryBoyController.approval);
router.delete("/deleteDeliveryBoy", DeliveryBoyController.deleteDeliveryBoy);

// --------------------------- offers ------------------------------------------

router.get("/offers", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/offers/ViewOffers", {
    title: "View offers",
    session: req.session,
    url: req.url,
  });
});
router.get("/create-offers", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  res.render("pages/offers/offers", {
    title: "View offers",
    session: req.session,
    url: req.url,
    offersId: 0,
  });
});
router.get("/update-offers/:updateId", function (req, res, next) {
  if (!req.session.user) res.redirect("/");
  let offersId = req.params.updateId;
  if (!offersId) {
    let error = new Error("Not Found");
    error.statusCode = 404;
    throw error;
  }
  let segments = req.url.split("/");
  res.render("pages/offers/offers", {
    title: "View product",
    session: req.session,
    offersId: offersId,
    url: "/" + segments[1],
  });
});
router.post("/saveCouponCodeDetails", OfferController.saveCouponCode);
router.post("/getAllCouponTables", OfferController.getAllCouponTables);
router.delete("/deleteOffer", OfferController.deleteOffer);
router.post("/getOfferById", OfferController.getOfferById);

//-----------client page----------------------

router.get("/home", function (req, res, next) {
  res.render("client/home", { title: "Home" });
});

router.post("/saveCouponCodeDetails", OfferController.saveCouponCode);
router.post("/getAllCouponTables", OfferController.getAllCouponTables);
router.delete("/deleteOffer", OfferController.deleteOffer);
router.post("/getOfferById", OfferController.getOfferById);
router.get("/home", function (req, res, next) {
  res.render("client/Home", { title: "Home", url: req.url });
});
module.exports = router;
// --------------------------
