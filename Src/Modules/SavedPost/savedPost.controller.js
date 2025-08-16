import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { 
  savePost, 
  unsavePost, 
  getSavedPosts,
  checkIfPostSaved 
} from "./Services/savedPost.service.js";

const router = Router();

// Save a post
router.post("/:postId", authMiddleware, errorHandler(savePost));

// Unsave a post
router.delete("/:postId", authMiddleware, errorHandler(unsavePost));

// Get all saved posts for current user
router.get("/", authMiddleware, errorHandler(getSavedPosts));

// Check if a post is saved by current user
router.get("/:postId/check", authMiddleware, errorHandler(checkIfPostSaved));

export { router as savedPostRoutes }; 