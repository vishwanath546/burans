const Joi = require("joi");
const Schemas = {
  loginValidation: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
  loginVendorValidation: Joi.object({
    mobile_Number: Joi.number().integer().min(10).required(),
  }),
  otpVerification: Joi.object({
    mobile_Number: Joi.number().integer().min(10).required(),
    otp: Joi.number().integer().min(4).required(),
  }),
  adminRegistration: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().integer().min(10).required(),
    password: Joi.string().required(),
  }),
  adminUpdate: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().integer().min(10).required(),
  }),

  vendorRegistration: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    shopName: Joi.string().required(),
    mobileNumber: Joi.number().integer().min(10).required(),
  }),
  //      Category form schemas
  categoryValidation: Joi.object({
    name: Joi.string().required(),
  }),
  productValidation: Joi.object({
    product_name: Joi.string().required(),
    category: Joi.string().required(),
    price: Joi.number().required(),
    sale_price: Joi.number().required(),
    price_quantity: Joi.string().required(),
  }),
  productImageValidation: Joi.object({
    product_id: Joi.number().required(),
  }),
};
module.exports = Schemas;
