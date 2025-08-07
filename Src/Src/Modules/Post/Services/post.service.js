import { PostModel } from "../../../DB/Models/Post.model.js";
import { UserModel } from "../../../DB/Models/User.model.js";
import { ReactionModel } from "../../../DB/Models/Reaction.model.js";
import { FollowerModel } from "../../../DB/Models/Follower.model.js";
import { PostVisibilityModel } from "../../../DB/Models/PostVisibility.model.js";

// Helper function to check if user can view a post
const canUserViewPost = async (post, viewerId) => {
  // Post owner can always view their own posts
  if (post.user.toString() === viewerId.toString()) {
    return true;
  }

  switch (post.visibility) {
    case "Public":
      return true;
    
    case "Private":
      return false;
    
    case "FriendsOnly":
      // Check if viewer is following the post owner
      const friendship = await FollowerModel.findOne({
        follower: viewerId,
        followed: post.user
      });
      return !!friendship;
    
    case "SpecificUsers":
      // Check if viewer is in the specific users list
      const visibilityPermission = await PostVisibilityModel.findOne({
        post: post._id,
        allowedUser: viewerId
      });
      return !!visibilityPermission;
    
    default:
      return false;
  }
};

// Create a new post
export const createPost = async (req, res) => {
  const { 
    content, 
    media, 
    thumbnail, 
    mood, 
    tags, 
    location, 
    visibility, 
    specificUsers,
    postType, 
    expiresAt 
  } = req.body;
  const userId = req.user._id;

  const postData = {
    user: userId,
    content,
    media,
    thumbnail,
    mood,
    tags,
    location,
    visibility: visibility || "Public",
    postType,
    expiresAt,
  };

  // If visibility is SpecificUsers, validate that specificUsers array is provided
  if (visibility === "SpecificUsers") {
    if (!specificUsers || !Array.isArray(specificUsers) || specificUsers.length === 0) {
      return res.status(400).json({
        status: "failure",
        error: "SpecificUsers visibility requires at least one user to be specified",
      });
    }
    
    // Validate that all specified users exist
    const existingUsers = await UserModel.find({
      _id: { $in: specificUsers }
    });
    
    if (existingUsers.length !== specificUsers.length) {
      return res.status(400).json({
        status: "failure",
        error: "One or more specified users do not exist",
      });
    }
  }

  const post = await PostModel.create(postData);

  // If visibility is SpecificUsers, create visibility permissions
  if (visibility === "SpecificUsers" && specificUsers) {
    const visibilityPermissions = specificUsers.map(userId => ({
      post: post._id,
      allowedUser: userId,
      grantedBy: userId
    }));
    
    await PostVisibilityModel.insertMany(visibilityPermissions);
  }

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
  const { page = 1, limit = 10, visibility, postType, mood } = req.query;
  const skip = (page - 1) * limit;
  const userId = req.user._id;

  // Build filter for posts the user can view
  const filter = {};
  
  if (postType) filter.postType = postType;
  if (mood) filter.mood = mood;

  // Get all posts that are public or belong to the user
  const publicPosts = await PostModel.find({
    ...filter,
    $or: [
      { visibility: "Public" },
      { user: userId }
    ]
  }).populate('user', 'username profileImage');

  // Get posts from friends that are FriendsOnly
  const friendPosts = await PostModel.find({
    ...filter,
    visibility: "FriendsOnly"
  }).populate('user', 'username profileImage');

  // Filter friend posts to only include those from users the current user follows
  const userFollows = await FollowerModel.find({ follower: userId });
  const followedUserIds = userFollows.map(f => f.followed.toString());
  
  const filteredFriendPosts = friendPosts.filter(post => 
    followedUserIds.includes(post.user._id.toString())
  );

  // Get posts with SpecificUsers visibility where current user is allowed
  const specificUserPosts = await PostModel.find({
    ...filter,
    visibility: "SpecificUsers"
  }).populate('user', 'username profileImage');

  const userSpecificPermissions = await PostVisibilityModel.find({
    allowedUser: userId
  });
  const allowedPostIds = userSpecificPermissions.map(p => p.post.toString());
  
  const filteredSpecificPosts = specificUserPosts.filter(post =>
    allowedPostIds.includes(post._id.toString())
  );

  // Combine all visible posts
  const allVisiblePosts = [
    ...publicPosts,
    ...filteredFriendPosts,
    ...filteredSpecificPosts
  ];

  // Sort by creation date and apply pagination
  allVisiblePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = allVisiblePosts.length;
  const posts = allVisiblePosts.slice(skip, skip + parseInt(limit));

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

  // Check if user can view this post
  const canView = await canUserViewPost(post, userId);
  if (!canView) {
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

  // Build filter based on visibility and relationship
  let filter = { user: userId };
  
  // If viewing own posts, show all
  if (userId === currentUserId.toString()) {
    // Show all posts
  } else {
    // Only show posts that the current user can view
    const publicPosts = await PostModel.find({
      user: userId,
      visibility: "Public"
    });

    const privatePosts = await PostModel.find({
      user: userId,
      visibility: "Private"
    });

    const friendsOnlyPosts = await PostModel.find({
      user: userId,
      visibility: "FriendsOnly"
    });

    const specificUserPosts = await PostModel.find({
      user: userId,
      visibility: "SpecificUsers"
    });

    // Check friendship for FriendsOnly posts
    const isFriend = await FollowerModel.findOne({
      follower: currentUserId,
      followed: userId
    });

    const visibleFriendsOnlyPosts = isFriend ? friendsOnlyPosts : [];

    // Check specific user permissions
    const userSpecificPermissions = await PostVisibilityModel.find({
      allowedUser: currentUserId,
      post: { $in: specificUserPosts.map(p => p._id) }
    });
    const allowedSpecificPostIds = userSpecificPermissions.map(p => p.post.toString());
    const visibleSpecificPosts = specificUserPosts.filter(post =>
      allowedSpecificPostIds.includes(post._id.toString())
    );

    // Combine all visible posts
    const allVisiblePosts = [
      ...publicPosts,
      ...visibleFriendsOnlyPosts,
      ...visibleSpecificPosts
    ];

    // Sort and paginate
    allVisiblePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = allVisiblePosts.length;
    const posts = allVisiblePosts.slice(skip, skip + parseInt(limit));

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

  // Handle visibility changes
  if (updateData.visibility === "SpecificUsers" && updateData.specificUsers) {
    // Remove existing permissions
    await PostVisibilityModel.deleteMany({ post: postId });
    
    // Create new permissions
    const visibilityPermissions = updateData.specificUsers.map(userId => ({
      post: postId,
      allowedUser: userId,
      grantedBy: userId
    }));
    
    await PostVisibilityModel.insertMany(visibilityPermissions);
  } else if (updateData.visibility !== "SpecificUsers") {
    // Remove specific user permissions if visibility is changed to something else
    await PostVisibilityModel.deleteMany({ post: postId });
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

  // Delete associated visibility permissions
  await PostVisibilityModel.deleteMany({ post: postId });

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
  const { content, visibility = "Public" } = req.body;

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
    visibility,
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