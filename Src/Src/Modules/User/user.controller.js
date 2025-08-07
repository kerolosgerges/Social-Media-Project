import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import {
    activateAccount,
  createAdmin,
  deleteAllUsers,
  deleteProfile,
  freezeProfile,
  getAllUsers,
  getProfile,
  updateProfile,
  updateUserPassword,
  shareAccount,
  getSharedAccounts,
  getMySharedAccounts,
  removeSharedAccess,
} from "./Services/user.service.js";
import { authorizeRoles } from "../../Middleware/Authorization.middleware.js";
import { validateSchema } from "../../Middleware/validation.middleware.js";
import {
    activateAccountSchema,
  createUserSchema,
  freezeAccountSchema,
  updateUserPasswordSchema,
  updateUserSchema,
} from "./Validators/user.schema.js";

export const userRoutes = Router();

userRoutes.get("/profile", authMiddleware, errorHandler(getProfile));

userRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  errorHandler(getAllUsers)
);

userRoutes.post(
  "/create-user",
  validateSchema(createUserSchema),
  authMiddleware,
  authorizeRoles("admin"),
  errorHandler(createAdmin)
);

userRoutes.patch(
  "/update-profile",
  validateSchema(updateUserSchema),
  authMiddleware,
  errorHandler(updateProfile)
);

userRoutes.patch(
  "/update-password",
  validateSchema(updateUserPasswordSchema),
  authMiddleware,
  errorHandler(updateUserPassword)
);

userRoutes.patch(
  "/freeze-profile",
  validateSchema(freezeAccountSchema),
  authMiddleware,
  errorHandler(freezeProfile)
);

userRoutes.patch(
    '/activate-profile',
    validateSchema(activateAccountSchema),
    errorHandler(activateAccount)
)

userRoutes.delete(
  "/delete-profile/:profileId",
  authMiddleware,
  authorizeRoles("admin"),
  errorHandler(deleteProfile)
);

userRoutes.delete(
  "/deleteAllUsers",
  authMiddleware,
  authorizeRoles("admin"),
  errorHandler(deleteAllUsers)
);

// Share Account Routes
userRoutes.post("/share-account", authMiddleware, errorHandler(shareAccount));

userRoutes.get("/shared-accounts", authMiddleware, errorHandler(getSharedAccounts));

userRoutes.get("/my-shared-accounts", authMiddleware, errorHandler(getMySharedAccounts));

userRoutes.delete("/remove-share/:shareId", authMiddleware, errorHandler(removeSharedAccess));
