const express = require('express');
const Router = express.Router();

const Validator = require('../validator/Validation');
const Schemas = require('../validator/Schemas');

const AdminController = require('../controller/AdminUserController');

Router.post("/create-admin-user" ,Validator(Schemas.adminRegistration),AdminController.saveAdmin);
Router.post("/verification",Validator(Schemas.loginValidation),AdminController.loginVerification);

module.exports = Router;
