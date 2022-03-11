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
  vendorRegistration: Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    shopName: Joi.string().required(),
    mobileNumber: Joi.number().integer().min(10).required(),
    gstNumber: Joi.string().required(),
    area: Joi.string().required(),
  }),
};
module.exports = Schemas;
