import { TrendingModel } from "../../../DB/Models/Trending.model.js";

// Create a new trending topic
export const createTrendingTopic = async (req, res) => {
  const { title, hashtag, description } = req.body;
  const createdBy = req.user._id;

  // Check if hashtag already exists
  const existingTopic = await TrendingModel.findOne({ hashtag });
  if (existingTopic) {
    return res.status(400).json({
      status: "failure",
      error: "Hashtag already exists",
    });
  }

  const trendingTopic = await TrendingModel.create({
    title,
    hashtag,
    description,
    createdBy,
  });

  await trendingTopic.populate("createdBy", "username profileImage");

  return res.status(201).json({
    status: "success",
    message: "Trending topic created successfully",
    trendingTopic,
  });
};

// Get all trending topics
export const getAllTrendingTopics = async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;
  const skip = (page - 1) * limit;

  const sortOptions = {};
  sortOptions[sortBy] = -1;

  const trendingTopics = await TrendingModel.find({ isDeleted: false })
    .populate("createdBy", "username profileImage")
    .skip(skip)
    .limit(parseInt(limit))
    .sort(sortOptions);

  const total = await TrendingModel.countDocuments({ isDeleted: false });

  return res.status(200).json({
    status: "success",
    trendingTopics,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTopics: total,
      hasNext: skip + trendingTopics.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get a specific trending topic by ID
export const getTrendingTopicById = async (req, res) => {
  const { topicId } = req.params;

  const trendingTopic = await TrendingModel.findById(topicId)
    .populate("createdBy", "username profileImage");

  if (!trendingTopic || trendingTopic.isDeleted) {
    return res.status(404).json({
      status: "failure",
      error: "Trending topic not found",
    });
  }

  return res.status(200).json({
    status: "success",
    trendingTopic,
  });
};

// Update a trending topic
export const updateTrendingTopic = async (req, res) => {
  const { topicId } = req.params;
  const { title, hashtag, description } = req.body;
  const userId = req.user._id;

  const trendingTopic = await TrendingModel.findById(topicId);

  if (!trendingTopic || trendingTopic.isDeleted) {
    return res.status(404).json({
      status: "failure",
      error: "Trending topic not found",
    });
  }

  // Check if user is the creator or has admin role
  if (trendingTopic.createdBy.toString() !== userId.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      status: "failure",
      error: "You can only update your own trending topics",
    });
  }

  // Check if hashtag already exists (if changing)
  if (hashtag && hashtag !== trendingTopic.hashtag) {
    const existingTopic = await TrendingModel.findOne({ 
      hashtag, 
      _id: { $ne: topicId } 
    });
    if (existingTopic) {
      return res.status(400).json({
        status: "failure",
        error: "Hashtag already exists",
      });
    }
  }

  // Update the topic
  const updatedTopic = await TrendingModel.findByIdAndUpdate(
    topicId,
    { title, hashtag, description },
    { new: true, runValidators: true }
  ).populate("createdBy", "username profileImage");

  return res.status(200).json({
    status: "success",
    message: "Trending topic updated successfully",
    trendingTopic: updatedTopic,
  });
};

// Delete a trending topic
export const deleteTrendingTopic = async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user._id;

  const trendingTopic = await TrendingModel.findById(topicId);

  if (!trendingTopic || trendingTopic.isDeleted) {
    return res.status(404).json({
      status: "failure",
      error: "Trending topic not found",
    });
  }

  // Check if user is the creator or has admin role
  if (trendingTopic.createdBy.toString() !== userId.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      status: "failure",
      error: "You can only delete your own trending topics",
    });
  }

  // Soft delete
  trendingTopic.isDeleted = true;
  await trendingTopic.save();

  return res.status(200).json({
    status: "success",
    message: "Trending topic deleted successfully",
  });
}; 