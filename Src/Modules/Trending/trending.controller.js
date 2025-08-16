import { Router } from "express";
import { authMiddleware } from "../../Middleware/Authentication.middleware.js";
import { errorHandler } from "../../Middleware/errorHandler.middleware.js";
import { 
  createTrendingTopic, 
  getAllTrendingTopics,
  getTrendingTopicById,
  updateTrendingTopic,
  deleteTrendingTopic
} from "./Services/trending.service.js";
import { validateSchema } from "../../Middleware/validation.middleware.js";
import { 
  createTrendingSchema, 
  updateTrendingSchema 
} from "./Validators/trending.schema.js";

const router = Router();

// Create a new trending topic
router.post(
  "/",
  validateSchema(createTrendingSchema),
  authMiddleware,
  errorHandler(createTrendingTopic)
);

// Get all trending topics
router.get("/", authMiddleware, errorHandler(getAllTrendingTopics));

// Get a specific trending topic by ID
router.get("/:topicId", authMiddleware, errorHandler(getTrendingTopicById));

// Update a trending topic
router.patch(
  "/:topicId",
  validateSchema(updateTrendingSchema),
  authMiddleware,
  errorHandler(updateTrendingTopic)
);

// Delete a trending topic
router.delete("/:topicId", authMiddleware, errorHandler(deleteTrendingTopic));

export { router as trendingRoutes }; 