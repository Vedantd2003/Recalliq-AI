import { errorResponse } from '../utils/response.js';

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return errorResponse(res, 'Validation failed', 422, errors);
    }

    req[property] = value;
    next();
  };
};

export default validate;
