import Joi from "joi";

export const createTrendingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must be at most 100 characters long",
      "any.required": "Title is required",
    }),
  hashtag: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^#[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.min": "Hashtag must be at least 2 characters long",
      "string.max": "Hashtag must be at most 50 characters long",
      "string.pattern.base": "Hashtag must start with # and contain only letters, numbers, and underscores",
      "any.required": "Hashtag is required",
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "Description must be at most 500 characters long",
    }),
});

export const updateTrendingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must be at most 100 characters long",
    }),
  hashtag: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^#[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      "string.min": "Hashtag must be at least 2 characters long",
      "string.max": "Hashtag must be at most 50 characters long",
      "string.pattern.base": "Hashtag must start with # and contain only letters, numbers, and underscores",
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "Description must be at most 500 characters long",
    }),
}); 