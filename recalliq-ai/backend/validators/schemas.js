import Joi from 'joi';

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and a number',
      'any.required': 'Password is required',
    }),
  company: Joi.string().trim().max(100).optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const analyzeMeetingSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'Meeting title is required',
  }),
  transcript: Joi.string().trim().min(50).max(100000).required().messages({
    'string.min': 'Transcript must be at least 50 characters',
    'string.max': 'Transcript cannot exceed 100,000 characters',
    'any.required': 'Transcript is required',
  }),
  participants: Joi.array().items(Joi.string().trim().max(100)).max(50).optional(),
  meetingDate: Joi.date().optional(),
  duration: Joi.number().integer().min(0).max(1440).optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(10).optional(),
});

const updateActionItemSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
  assignee: Joi.string().trim().max(100).optional(),
  dueDate: Joi.date().optional().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  company: Joi.string().trim().max(100).optional().allow(''),
  avatar: Joi.string().uri().optional().allow(null, ''),
});

export {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  analyzeMeetingSchema,
  updateActionItemSchema,
  updateProfileSchema,
};
