import { ReactionModel } from "../../../DB/Models/Reaction.model.js";
import { PostModel } from "../../../DB/Models/Post.model.js";
import { createNotification } from "../../Notification/Services/notification.service.js";
import mongoose from "mongoose";

// Socket.IO instance (will be set from app.controller.js)
let io = null;

// Function to set Socket.IO instance
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Add a reaction to a post
export const addReaction = async (req, res) => {
  const { postId } = req.params;
  const { type } = req.body;
  const userId = req.user._id;

  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Check if user already has a reaction on this post
  const existingReaction = await ReactionModel.findOne({
    user: userId,
    post: postId,
  });

  if (existingReaction) {
    // Update existing reaction
    existingReaction.type = type;
    await existingReaction.save();

    return res.status(200).json({
      status: "success",
      message: "Reaction updated successfully",
      reaction: existingReaction,
    });
  }

  // Create new reaction
  const reaction = await ReactionModel.create({
    user: userId,
    post: postId,
    type,
  });

  await reaction.populate("user", "username profileImage");

  // Create notification for post owner (if not the same user)
  if (post.user.toString() !== userId.toString()) {
    await createNotification({
      userId: post.user,
      type: "new_reaction",
      fromUser: userId,
      postId: postId,
      message: `${reaction.user.username} reacted to your post`,
      metadata: { 
        reactionType: type,
        reactionId: reaction._id,
        postId: postId 
      },
    });

    // Emit real-time notification if Socket.IO is available
    if (io) {
      io.to(`user_${post.user}`).emit("new_notification", {
        type: "new_reaction",
        fromUser: {
          _id: userId,
          username: reaction.user.username,
          profileImage: reaction.user.profileImage,
        },
        postId: postId,
        message: `${reaction.user.username} reacted to your post`,
      });
    }
  }

  return res.status(201).json({
    status: "success",
    message: "Reaction added successfully",
    reaction,
  });
};

// Remove a reaction from a post
export const removeReaction = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const reaction = await ReactionModel.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!reaction) {
    return res.status(404).json({
      status: "failure",
      error: "Reaction not found",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Reaction removed successfully",
  });
};

// Get all reactions for a specific post
export const getPostReactions = async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const reactions = await ReactionModel.find({ post: postId })
    .populate("user", "username profileImage")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await ReactionModel.countDocuments({ post: postId });

  return res.status(200).json({
    status: "success",
    reactions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReactions: total,
      hasNext: skip + reactions.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get reaction counts for a post
export const getReactionCounts = async (req, res) => {
  const { postId } = req.params;

  const reactionCounts = await ReactionModel.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId) } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalReactions = await ReactionModel.countDocuments({ post: postId });

  // Format the response
  const counts = {};
  reactionCounts.forEach((item) => {
    counts[item._id] = item.count;
  });

  return res.status(200).json({
    status: "success",
    counts,
    totalReactions,
  });
}; 