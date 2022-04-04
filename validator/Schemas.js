const Joi = require("joi");
const Schemas = {

  loginValidation: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
  adminRegistration: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().integer().min(10).required(),
    password: Joi.string().required(),
  }),
  adminUpdate :Joi.object({
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
    price_quantity: Joi.string().required()
  }),

};
module.exports = Schemas;
