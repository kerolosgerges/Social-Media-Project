import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  sharePost,
  getPostsByUser,
} from "./Services/post.service.js";
import { validateSchema } from "../../Middleware/validation.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
} from "./Validators/post.schema.js";

const router = Router();

// Create a new post
router.post(
  "/",
  validateSchema(createPostSchema),
  authMiddleware,
  errorHandler(createPost)
);

// Get all posts (with pagination and filters)
router.get("/", authMiddleware, errorHandler(getAllPosts));

// Get current user's posts
router.get("/my", authMiddleware, errorHandler(getMyPosts));

// Get posts by a specific user
router.get("/user/:userId", authMiddleware, errorHandler(getPostsByUser));

// Get a specific post by ID
router.get("/:postId", authMiddleware, errorHandler(getPostById));

// Update a post
router.patch(
  "/:postId",
  validateSchema(updatePostSchema),
  authMiddleware,
  errorHandler(updatePost)
);

// Delete a post
router.delete("/:postId", authMiddleware, errorHandler(deletePost));

// Like a post
router.post("/:postId/like", authMiddleware, errorHandler(likePost));

// Unlike a post
router.delete("/:postId/like", authMiddleware, errorHandler(unlikePost));

// Share a post
router.post("/:postId/share", authMiddleware, errorHandler(sharePost));

export { router as postRoutes }; 