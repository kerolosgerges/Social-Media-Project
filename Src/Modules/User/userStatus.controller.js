import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { 
  getUserStatus, 
  updateUserStatus 
} from "./Services/userStatus.service.js";

const router = Router();

// Get user status (online/offline + last seen)
router.get("/:userId/status", authMiddleware, errorHandler(getUserStatus));

// Update current user's status
router.patch("/status", authMiddleware, errorHandler(updateUserStatus));

export { router as userStatusRoutes }; 