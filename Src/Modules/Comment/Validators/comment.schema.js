import Joi from "joi";

export const commentSchema = {
  createComment: Joi.object({
    postId: Joi.string().required().messages({
      "string.empty": "Post ID is required",
      "any.required": "Post ID is required",
    }),
    content: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "Comment content cannot be empty",
      "string.min": "Comment content must be at least 1 character long",
      "string.max": "Comment content cannot exceed 1000 characters",
      "any.required": "Comment content is required",
    }),
    media: Joi.string().uri().optional().messages({
      "string.uri": "Media must be a valid URL",
    }),
    parentId: Joi.string().optional().messages({
      "string.empty": "Parent comment ID must be a valid string",
    }),
  }),

  updateComment: Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "Comment content cannot be empty",
      "string.min": "Comment content must be at least 1 character long",
      "string.max": "Comment content cannot exceed 1000 characters",
      "any.required": "Comment content is required",
    }),
    media: Joi.string().uri().optional().messages({
      "string.uri": "Media must be a valid URL",
    }),
  }),
}; 