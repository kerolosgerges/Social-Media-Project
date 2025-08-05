import { PostModel } from "../../../DB/Models/Post.model.js";
import { UserModel } from "../../../DB/Models/User.model.js";
import { ReactionModel } from "../../../DB/Models/Reaction.model.js";

// Create a new post
export const createPost = async (req, res) => {
  const { content, media, thumbnail, mood, tags, location, privacy, postType, expiresAt } = req.body;
  const userId = req.user._id;

  const post = await PostModel.create({
    user: userId,
    content,
    media,
    thumbnail,
    mood,
    tags,
    location,
    privacy,
    postType,
    expiresAt,
  });

  // Populate user information
  await post.populate('user', 'username profileImage');

  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    post,
  });
};

// Get all posts with pagination and filters
export const getAllPosts = async (req, res) => {
  const { page = 1, limit = 10, privacy = "public", postType, mood } = req.query;
  const skip = (page - 1) * limit;

  const filter = { privacy };
  
  if (postType) filter.postType = postType;
  if (mood) filter.mood = mood;

  const posts = await PostModel.find(filter)
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PostModel.countDocuments(filter);

  return res.status(200).json({
    status: "success",
    posts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: skip + posts.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get a specific post by ID
export const getPostById = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await PostModel.findById(postId)
    .populate('user', 'username profileImage')
    .populate('sharedPostId', 'content user');

  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if user can view this post based on privacy settings
  if (post.privacy === "private" && post.user._id.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "failure",
      error: "Access denied",
    });
  }

  // Increment view count
  post.views += 1;
  await post.save();

  return res.status(200).json({
    status: "success",
    post,
  });
};

// Get current user's posts
export const getMyPosts = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const posts = await PostModel.find({ user: userId })
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PostModel.countDocuments({ user: userId });

  return res.status(200).json({
    status: "success",
    posts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: skip + posts.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get posts by a specific user
export const getPostsByUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: "failure",
      error: "User not found",
    });
  }

  // Build filter based on privacy and relationship
  let filter = { user: userId };
  
  // If viewing own posts, show all
  if (userId === currentUserId.toString()) {
    // Show all posts
  } else {
    // Only show public posts or posts shared with friends
    filter.privacy = { $in: ["public", "friends"] };
  }

  const posts = await PostModel.find(filter)
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PostModel.countDocuments(filter);

  return res.status(200).json({
    status: "success",
    posts,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: skip + posts.length < total,
      hasPrev: page > 1,
    },
  });
};

// Update a post
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  const post = await PostModel.findById(postId);

  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if user owns the post
  if (post.user.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "failure",
      error: "You can only update your own posts",
    });
  }

  const updatedPost = await PostModel.findByIdAndUpdate(
    postId,
    updateData,
    { new: true }
  ).populate('user', 'username profileImage');

  return res.status(200).json({
    status: "success",
    message: "Post updated successfully",
    post: updatedPost,
  });
};

// Delete a post
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await PostModel.findById(postId);

  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if user owns the post
  if (post.user.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "failure",
      error: "You can only delete your own posts",
    });
  }

  await PostModel.findByIdAndDelete(postId);

  return res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
};

// Like a post
export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if user already liked the post
  const existingReaction = await ReactionModel.findOne({
    user: userId,
    post: postId,
    type: "like",
  });

  if (existingReaction) {
    return res.status(400).json({
      status: "failure",
      error: "You have already liked this post",
    });
  }

  // Create reaction
  await ReactionModel.create({
    user: userId,
    post: postId,
    type: "like",
  });

  // Update post like count
  post.likesCount += 1;
  await post.save();

  return res.status(200).json({
    status: "success",
    message: "Post liked successfully",
  });
};

// Unlike a post
export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Remove reaction
  const deletedReaction = await ReactionModel.findOneAndDelete({
    user: userId,
    post: postId,
    type: "like",
  });

  if (!deletedReaction) {
    return res.status(400).json({
      status: "failure",
      error: "You have not liked this post",
    });
  }

  // Update post like count
  post.likesCount = Math.max(0, post.likesCount - 1);
  await post.save();

  return res.status(200).json({
    status: "success",
    message: "Post unliked successfully",
  });
};

// Share a post
export const sharePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { content, privacy = "public" } = req.body;

  const originalPost = await PostModel.findById(postId)
    .populate('user', 'username profileImage');

  if (!originalPost) {
    return res.status(404).json({
      status: "failure",
      error: "Original post not found",
    });
  }

  // Create a new post that references the original
  const sharedPost = await PostModel.create({
    user: userId,
    content: content || `Shared: ${originalPost.content}`,
    sharedPostId: postId,
    privacy,
    postType: "text",
  });

  await sharedPost.populate('user', 'username profileImage');
  await sharedPost.populate('sharedPostId', 'content user');

  return res.status(201).json({
    status: "success",
    message: "Post shared successfully",
    post: sharedPost,
  });
}; 