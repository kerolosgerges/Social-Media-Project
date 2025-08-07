import { CommentModel } from "../../../DB/Models/Comment.model.js";
import { PostModel } from "../../../DB/Models/Post.model.js";
import { UserModel } from "../../../DB/Models/User.model.js";

// Create a new comment
export const createComment = async (req, res) => {
  const { postId, content, media, parentId } = req.body;
  const userId = req.user._id;

  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // If parentId is provided, check if parent comment exists
  if (parentId) {
    const parentComment = await CommentModel.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({
        status: "failure",
        error: "Parent comment not found",
      });
    }
  }

  const comment = await CommentModel.create({
    post: postId,
    user: userId,
    content,
    media,
    parentId,
  });

  // Populate user information
  await comment.populate('user', 'username profileImage');

  // Update post comment count
  post.commentsCount = (post.commentsCount || 0) + 1;
  await post.save();

  return res.status(201).json({
    status: "success",
    message: "Comment created successfully",
    comment,
  });
};

// Get all comments for a post with pagination
export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;
  const skip = (page - 1) * limit;

  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      status: "failure",
      error: "Post not found",
    });
  }

  // Build sort object
  let sortObject = {};
  switch (sort) {
    case "newest":
      sortObject = { createdAt: -1 };
      break;
    case "oldest":
      sortObject = { createdAt: 1 };
      break;
    case "mostLiked":
      sortObject = { likesCount: -1, createdAt: -1 };
      break;
    default:
      sortObject = { createdAt: -1 };
  }

  // Get top-level comments (no parentId)
  const comments = await CommentModel.find({ 
    post: postId, 
    parentId: null 
  })
    .populate('user', 'username profileImage')
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit));

  // Get reply counts for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replyCount = await CommentModel.countDocuments({ 
        parentId: comment._id 
      });
      return {
        ...comment.toObject(),
        replyCount,
      };
    })
  );

  const total = await CommentModel.countDocuments({ 
    post: postId, 
    parentId: null 
  });

  return res.status(200).json({
    status: "success",
    comments: commentsWithReplies,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalComments: total,
      hasNext: skip + comments.length < total,
      hasPrev: page > 1,
    },
  });
};

// Get a specific comment by ID
export const getCommentById = async (req, res) => {
  const { commentId } = req.params;

  const comment = await CommentModel.findById(commentId)
    .populate('user', 'username profileImage')
    .populate('parentId', 'content user');

  if (!comment) {
    return res.status(404).json({
      status: "failure",
      error: "Comment not found",
    });
  }

  // Get reply count
  const replyCount = await CommentModel.countDocuments({ 
    parentId: comment._id 
  });

  return res.status(200).json({
    status: "success",
    comment: {
      ...comment.toObject(),
      replyCount,
    },
  });
};

// Update a comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const { content, media } = req.body;

  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      status: "failure",
      error: "Comment not found",
    });
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "failure",
      error: "You can only update your own comments",
    });
  }

  const updatedComment = await CommentModel.findByIdAndUpdate(
    commentId,
    { content, media },
    { new: true }
  ).populate('user', 'username profileImage');

  return res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
    comment: updatedComment,
  });
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      status: "failure",
      error: "Comment not found",
    });
  }

  // Check if user owns the comment
  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      status: "failure",
      error: "You can only delete your own comments",
    });
  }

  // Delete all replies to this comment
  await CommentModel.deleteMany({ parentId: commentId });

  // Delete the comment
  await CommentModel.findByIdAndDelete(commentId);

  // Update post comment count
  const post = await PostModel.findById(comment.post);
  if (post) {
    const totalDeletedComments = await CommentModel.countDocuments({ 
      post: comment.post, 
      _id: { $in: [commentId] } 
    });
    post.commentsCount = Math.max(0, (post.commentsCount || 0) - totalDeletedComments);
    await post.save();
  }

  return res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
  });
};

// Like a comment
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      status: "failure",
      error: "Comment not found",
    });
  }

  // Check if user already liked the comment
  const existingReaction = comment.reactions.find(
    reaction => reaction.user.toString() === userId.toString()
  );

  if (existingReaction) {
    return res.status(400).json({
      status: "failure",
      error: "You have already reacted to this comment",
    });
  }

  // Add reaction
  comment.reactions.push({
    user: userId,
    emoji: "👍",
  });
  comment.likesCount += 1;
  await comment.save();

  return res.status(200).json({
    status: "success",
    message: "Comment liked successfully",
  });
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    return res.status(404).json({
      status: "failure",
      error: "Comment not found",
    });
  }

  // Remove reaction
  const reactionIndex = comment.reactions.findIndex(
    reaction => reaction.user.toString() === userId.toString()
  );

  if (reactionIndex === -1) {
    return res.status(400).json({
      status: "failure",
      error: "You have not reacted to this comment",
    });
  }

  comment.reactions.splice(reactionIndex, 1);
  comment.likesCount = Math.max(0, comment.likesCount - 1);
  await comment.save();

  return res.status(200).json({
    status: "success",
    message: "Comment unliked successfully",
  });
};

// Get replies to a comment
export const getCommentReplies = async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Check if parent comment exists
  const parentComment = await CommentModel.findById(commentId);
  if (!parentComment) {
    return res.status(404).json({
      status: "failure",
      error: "Parent comment not found",
    });
  }

  const replies = await CommentModel.find({ parentId: commentId })
    .populate('user', 'username profileImage')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await CommentModel.countDocuments({ parentId: commentId });

  return res.status(200).json({
    status: "success",
    replies,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReplies: total,
      hasNext: skip + replies.length < total,
      hasPrev: page > 1,
    },
  });
}; 