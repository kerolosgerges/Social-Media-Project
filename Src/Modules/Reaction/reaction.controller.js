import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { 
  addReaction, 
  removeReaction, 
  getPostReactions,
  getReactionCounts 
} from "./Services/reaction.service.js";
import { validateSchema } from "../../Middleware/validation.middleware.js";
import { addReactionSchema } from "./Validators/reaction.schema.js";

const router = Router();

// Add a reaction to a post
router.post(
  "/:postId",
  validateSchema(addReactionSchema),
  authMiddleware,
  errorHandler(addReaction)
);

// Remove a reaction from a post
router.delete("/:postId", authMiddleware, errorHandler(removeReaction));

// Get all reactions for a specific post
router.get("/:postId", authMiddleware, errorHandler(getPostReactions));

// Get reaction counts for a post
router.get("/:postId/counts", authMiddleware, errorHandler(getReactionCounts));

export { router as reactionRoutes }; 