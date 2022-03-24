const express = require('express');
const router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {title: 'Burans Login'});
});

router.get('/dashboard', function (req, res, next) {
    res.render('pages/dashboard', {title: 'Burans Login',url:req.url});
});

router.get('/customer', function (req, res, next) {
    res.render('pages/customer/view_customer', {title: 'View customer',url:req.url});
});

router.get('/products', function (req, res, next) {
    res.render('pages/product/ViewProducts', {title: 'View product',url:req.url});
});

router.get('/create-product', function (req, res, next) {
    res.render('pages/product/ProductForm', {title: 'Create Product',url:req.url});
});

router.get('/categories', function (req, res, next) {
    res.render('pages/product/category', {title: 'View product',url:req.url});
});

router.get('/create-categories', function (req, res, next) {
    res.render('pages/product/CategoryForm', {title: 'View product',url:req.url});
});

module.exports = router;
