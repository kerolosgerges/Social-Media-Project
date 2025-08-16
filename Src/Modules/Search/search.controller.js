import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { searchUsers, searchPosts } from "./Services/search.service.js";

const router = Router();

// Search users by username or email
router.get("/users", authMiddleware, errorHandler(searchUsers));

// Search posts by content or hashtags
router.get("/posts", authMiddleware, errorHandler(searchPosts));

export { router as searchRoutes }; 