import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { 
  followUser, 
  unfollowUser, 
  getFollowers,
  getFollowing,
  getFriends,
  checkFollowStatus
} from "./Services/follow.service.js";

const router = Router();

// Follow a user
router.post("/:userId", authMiddleware, errorHandler(followUser));

// Unfollow a user
router.delete("/:userId", authMiddleware, errorHandler(unfollowUser));

// Get followers of current user
router.get("/followers", authMiddleware, errorHandler(getFollowers));

// Get users that current user is following
router.get("/following", authMiddleware, errorHandler(getFollowing));

// Get mutual friends (users who follow each other)
router.get("/friends", authMiddleware, errorHandler(getFriends));

// Check follow status between current user and another user
router.get("/:userId/status", authMiddleware, errorHandler(checkFollowStatus));

export { router as followRoutes }; 