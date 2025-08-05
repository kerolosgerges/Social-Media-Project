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

export const postRoutes = Router();

// Create a new post
postRoutes.post(
  "/",
  validateSchema(createPostSchema),
  authMiddleware,
  errorHandler(createPost)
);

// Get all posts (with pagination and filters)
postRoutes.get("/", authMiddleware, errorHandler(getAllPosts));

// Get current user's posts
postRoutes.get("/my/posts", authMiddleware, errorHandler(getMyPosts));

// Get posts by a specific user
postRoutes.get("/user/:userId", authMiddleware, errorHandler(getPostsByUser));

// Get a specific post by ID
postRoutes.get("/:postId", authMiddleware, errorHandler(getPostById));

// Update a post
postRoutes.patch(
  "/:postId",
  validateSchema(updatePostSchema),
  authMiddleware,
  errorHandler(updatePost)
);

// Delete a post
postRoutes.delete("/:postId", authMiddleware, errorHandler(deletePost));

// Like a post
postRoutes.post("/:postId/like", authMiddleware, errorHandler(likePost));

// Unlike a post
postRoutes.delete("/:postId/like", authMiddleware, errorHandler(unlikePost));

// Share a post
postRoutes.post("/:postId/share", authMiddleware, errorHandler(sharePost)); 