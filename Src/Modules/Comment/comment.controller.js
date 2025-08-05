import * as commentService from './Services/comment.service.js';

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const result = await commentService.createComment(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Get all comments for a post
export const getCommentsByPost = async (req, res) => {
  try {
    const result = await commentService.getCommentsByPost(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Get a specific comment by ID
export const getCommentById = async (req, res) => {
  try {
    const result = await commentService.getCommentById(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const result = await commentService.updateComment(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const result = await commentService.deleteComment(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const result = await commentService.likeComment(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const result = await commentService.unlikeComment(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
};

// Get replies to a comment
export const getCommentReplies = async (req, res) => {
  try {
    const result = await commentService.getCommentReplies(req, res);
    return result;
  } catch (error) {
    return res.status(500).json({
      status: "failure",
      error: "Internal server error",
      message: error.message
    });
  }
}; 