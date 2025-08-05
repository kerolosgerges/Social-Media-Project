import express from "express";
import * as commentController from "./comment.controller.js";
import { authenticate } from "../../Middleware/Authentication.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { commentSchema } from "./Validators/comment.schema.js";

const router = express.Router();

// Apply authentication middleware to all comment routes
router.use(authenticate);

// Create a new comment
router.post("/", validate(commentSchema.createComment), commentController.createComment);

// Get all comments for a post
router.get("/post/:postId", commentController.getCommentsByPost);

// Get a specific comment by ID
router.get("/:commentId", commentController.getCommentById);

// Update a comment
router.put("/:commentId", validate(commentSchema.updateComment), commentController.updateComment);

// Delete a comment
router.delete("/:commentId", commentController.deleteComment);

// Like a comment
router.post("/:commentId/like", commentController.likeComment);

// Unlike a comment
router.delete("/:commentId/like", commentController.unlikeComment);

// Get replies to a comment
router.get("/:commentId/replies", commentController.getCommentReplies);

export default router; 