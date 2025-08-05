import express from "express";
import { getProfileController } from "./Services/user.controller.js";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { authorizeRoles } from "../../Middleware/Authorization.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfileController);

router.get(
  "/admin/stats",
  authMiddleware,               
  authorizeRoles("admin"),    
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;
