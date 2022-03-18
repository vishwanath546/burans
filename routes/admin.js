const express = require('express');
const Router = express.Router();
const isAuth = require('../middleware/is-auth')
const Validator = require('../validator/Validation');
const Schemas = require('../validator/Schemas');

const AdminController = require('../controller/AdminUserController');

Router.post("/create-admin-user" ,isAuth,Validator(Schemas.adminRegistration),AdminController.saveAdmin);
Router.put("/update-admin-user/:userId" ,isAuth,Validator(Schemas.adminUpdate),AdminController.updateAdmin);
Router.post("/verification",Validator(Schemas.loginValidation),AdminController.loginVerification);
Router.delete("/deleteUser/:userId",isAuth,AdminController.deleteAdminUser)
Router.get("/getUser/:userId",isAuth,AdminController.getUser)


module.exports = Router;
