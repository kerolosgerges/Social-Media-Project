import { FollowerModel } from "../../../DB/Models/Follower.model.js";
import { UserModel } from "../../../DB/Models/User.model.js";
import { createNotification } from "../../Notification/Services/notification.service.js";

// Socket.IO instance (will be set from app.controller.js)
let io = null;

// Function to set Socket.IO instance
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Follow a user
export const followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Prevent self-following
  if (currentUserId.toString() === userId) {
    return res.status(400).json({
      status: "failure",
      error: "You cannot follow yourself",
    });
  }

  // Check if target user exists
  const targetUser = await UserModel.findById(userId);
  if (!targetUser) {
    return res.status(404).json({
      status: "failure",
      error: "User not found",
    });
  }

  // Check if already following
  const existingFollow = await FollowerModel.findOne({
    follower: currentUserId,
    following: userId,
  });

  if (existingFollow) {
    return res.status(400).json({
      status: "failure",
      error: "You are already following this user",
    });
  }

  // Create follow relationship
  const follow = await FollowerModel.create({
    follower: currentUserId,
    following: userId,
  });

  await follow.populate("following", "username profileImage bio");

  // Create notification for the user being followed
  await createNotification({
    userId: userId,
    type: "new_follow",
    fromUser: currentUserId,
    message: `${req.user.username} started following you`,
    metadata: { followerId: currentUserId },
  });

  // Emit real-time notification if Socket.IO is available
  if (io) {
    io.to(`user_${userId}`).emit("new_notification", {
      type: "new_follow",
      fromUser: {
        _id: currentUserId,
        username: req.user.username,
        profileImage: req.user.profileImage,
      },
      message: `${req.user.username} started following you`,
    });
  }

  return res.status(201).json({
    status: "success",
    message: "User followed successfully",
    follow,
  });
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const follow = await FollowerModel.findOneAndDelete({
    follower: currentUserId,
    following: userId,
  });

  if (!follow) {
    return res.status(404).json({
      status: "failure",
      error: "Follow relationship not found",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "User unfollowed successfully",
  });
};

// Get followers of current user
export const getFollowers = async (req, res) => {
  const currentUserId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const followers = await FollowerModel.find({ following: currentUserId })
    .populate("follower", "username profileImage bio")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await FollowerModel.countDocuments({ following: currentUserId });

  return res.status(200).json({
    status: "success",
    followers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFollowers: total,
      hasNext: skip + followers.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get users that current user is following
export const getFollowing = async (req, res) => {
  const currentUserId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const following = await FollowerModel.find({ follower: currentUserId })
    .populate("following", "username profileImage bio")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await FollowerModel.countDocuments({ follower: currentUserId });

  return res.status(200).json({
    status: "success",
    following,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFollowing: total,
      hasNext: skip + following.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get mutual friends (users who follow each other)
export const getFriends = async (req, res) => {
  const currentUserId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  // Find users that current user follows
  const following = await FollowerModel.find({ follower: currentUserId })
    .select("following");

  const followingIds = following.map(f => f.following);

  // Find users who also follow current user (mutual)
  const friends = await FollowerModel.find({
    follower: { $in: followingIds },
    following: currentUserId,
  })
    .populate("follower", "username profileImage bio")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await FollowerModel.countDocuments({
    follower: { $in: followingIds },
    following: currentUserId,
  });

  return res.status(200).json({
    status: "success",
    friends,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFriends: total,
      hasNext: skip + friends.length < total,
      hasPrev: page > 1,
    },
  });
};

// Check follow status between current user and another user
export const checkFollowStatus = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const [isFollowing, isFollowedBy] = await Promise.all([
    FollowerModel.findOne({
      follower: currentUserId,
      following: userId,
    }),
    FollowerModel.findOne({
      follower: userId,
      following: currentUserId,
    }),
  ]);

  const status = {
    isFollowing: !!isFollowing,
    isFollowedBy: !!isFollowedBy,
    isFriend: !!(isFollowing && isFollowedBy),
  };

  return res.status(200).json({
    status: "success",
    followStatus: status,
  });
}; 