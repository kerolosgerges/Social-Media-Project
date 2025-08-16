import Joi from "joi";

export const addReactionSchema = Joi.object({
  type: Joi.string()
    .valid("like", "love", "haha", "wow", "sad", "angry")
    .required()
    .messages({
      "any.required": "Reaction type is required",
      "any.only": "Reaction type must be one of: like, love, haha, wow, sad, angry",
    }),
}); 