import { SavedPostModel } from "../../../DB/Models/SavedPost.model.js";
import { PostModel } from "../../../DB/Models/Post.model.js";

// Save a post
export const savePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if post is already saved
  const existingSavedPost = await SavedPostModel.findOne({
    user: userId,
    post: postId,
  });

  if (existingSavedPost) {
    return res.status(400).json({
      status: "failure",
      error: "Post is already saved",
    });
  }

  // Save the post
  const savedPost = await SavedPostModel.create({
    user: userId,
    post: postId,
  });

  await savedPost.populate({
    path: "post",
    populate: {
      path: "user",
      select: "username profileImage",
    },
  });

  return res.status(201).json({
    status: "success",
    message: "Post saved successfully",
    savedPost,
  });
};

// Unsave a post
export const unsavePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const savedPost = await SavedPostModel.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!savedPost) {
    return res.status(404).json({
      status: "failure",
      error: "Saved post not found",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Post unsaved successfully",
  });
};

// Get all saved posts for current user
export const getSavedPosts = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const savedPosts = await SavedPostModel.find({ user: userId })
    .populate({
      path: "post",
      populate: {
        path: "user",
        select: "username profileImage",
      },
    })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await SavedPostModel.countDocuments({ user: userId });

  return res.status(200).json({
    status: "success",
    savedPosts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalSavedPosts: total,
      hasNext: skip + savedPosts.length < total,
      hasPrev: page > 1,
    },
  });
};

// Check if a post is saved by current user
export const checkIfPostSaved = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const savedPost = await SavedPostModel.findOne({
    user: userId,
    post: postId,
  });

  return res.status(200).json({
    status: "success",
    isSaved: !!savedPost,
  });
}; 