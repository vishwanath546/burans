const express = require('express');
const router = express.Router();

const CategoryController = require('../controller/CategoryController');
const ProductController = require('../controller/ProductController');

const Validator = require('../validator/Validation');
const Schemas = require('../validator/Schemas');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Burans Login' });
});

router.get('/dashboard', function (req, res, next) {
    res.render('pages/dashboard', {title: 'Burans Login', url: req.url});
});

router.get('/customer', function (req, res, next) {
    res.render('pages/customer/view_customer', {title: 'View customer', url: req.url});
});
// ---------------------------- Category ---------------------------------
router.get('/categories', function (req, res, next) {
    res.render('pages/product/category', {title: 'View product', url: req.url});
});

router.get('/create-categories', function (req, res, next) {
    res.render('pages/product/CategoryForm', {title: 'View product', url: req.url, categoryId: 0});
});
router.get('/update-categories', function (req, res, next) {
    let categoryId = req.params.updateID;
    res.render('pages/product/CategoryForm', {title: 'View product', url: req.url, categoryId: categoryId});
});

router.get('/getAllCategories', CategoryController.getAllCategories);
router.get('/getCategoryById', CategoryController.getCategoryById);
router.post("/saveCategorySubcategory", Validator(Schemas.categoryValidation), CategoryController.saveCategorySubcategory);
router.post('/getAllCategoriesOptions', CategoryController.getAllCategoriesOption);
router.post('/getAllSubcategoriesOption/:categoryId', CategoryController.getAllSubcategoriesOption);
router.post('/getAllCategoriesTables', CategoryController.getAllCategoriesTables);
router.put("/updateCategoryStatus", CategoryController.updateCategoryStatus);
router.delete("/deleteCategory", CategoryController.deleteCategory);

// --------------------------- product --------------------------------------

router.get('/products', function (req, res, next) {
    res.render('pages/product/ViewProducts', {title: 'View product', url: req.url});
});

router.get('/create-product', function (req, res) {
    res.render('pages/product/ProductForm', {title: 'Create Product', url: req.url, productId: 0});
});

router.get('/update-product/:updateID', function(req, res) {
    let productId = req.params.updateID;
    if (!productId) {
        let error = new Error('Not Found');
        error.statusCode = 404;
        throw error
    }
    let segments = req.url.split('/');
    res.render('pages/product/ProductForm', {title: 'Create Product', url: '/' + segments[1], productId: productId});
});
router.post("/uploadProductsImages", ProductController.uploadProductsImages);

router.post("/saveProductDetails", Validator(Schemas.productValidation), ProductController.saveProductDetails);
router.post('/getProductById', ProductController.getProductById);


// --------------------------- vendor ------------------------------------------

router.get('/view-vendor', function (req, res, next) {
    res.render('pages/vendor/vendors', {title: 'View vendor',url:req.url});
});

router.get('/create-vendor', function (req, res, next) {
    res.render('pages/vendor/VendorForm', {title: 'create vendor',url:req.url,vendorId:0});
});

router.get('/create-vendor', function(req, res, next) {
    res.render('pages/vendor/VendorForm', { title: 'View product', url: req.url });
});
router.get('/update-vendor/:updateId', function (req, res, next) {
    let vendorId= req.params.updateId;
    if(!vendorId){
        let error = new Error('Not Found');
        error.statusCode=404;
        throw error
    }
    let segments = req.url.split('/');
    res.render('pages/vendor/VendorForm', {title: 'View product',url:'/' + segments[1],vendorId:vendorId});
});


router.get('/create-delivery-boy', function(req, res, next) {
    res.render('pages/DeliveryBoy/DeliveryBoy', { title: 'View product', url: req.url });
});


// --------------------------- offers ------------------------------------------

router.get('/create-offer', function(req, res, next) {
    res.render('pages/offers/offers', { title: 'View product', url: req.url });
});
router.get('/create-coupons', function(req, res, next) {
    res.render('pages/offers/coupon', { title: 'View product', url: req.url });
});
module.exports = router;
