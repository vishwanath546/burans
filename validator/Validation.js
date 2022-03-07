const Validation = (schema, property) => {
    return (req, res, next) => {
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true, // remove unknown props
        };
        const {error} = schema.validate(req.body, options);
        const valid = error == null;
        if (valid) {
            next();
        } else {
            const {details} = error;
            const message = details.map(i => i.message);
            res.status(422).json({error: message})
        }
    }
}
module.exports = Validation;
