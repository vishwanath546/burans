const Joi = require('joi');
const Schemas = {
    loginValidation: Joi.object(
        {
            username: Joi.string().required(),
            password: Joi.string().required()
        }),
    adminRegistration:Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobileNumber: Joi.number().integer().min(10).required(),
        password: Joi.string().required()
    })
};
module.exports = Schemas;
