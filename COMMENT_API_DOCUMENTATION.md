# Comment API Documentation

## Overview
This document describes the Comment API endpoints for the social media application. All endpoints require authentication.

## Base URL
```
http://localhost:3000/api/comments
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create a Comment
**POST** `/api/comments`

Creates a new comment on a post. Supports nested comments (replies).

**Request Body:**
```json
{
  "postId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "content": "Great post! Thanks for sharing.",
  "media": "https://example.com/image.jpg", // optional
  "parentId": "64f8a1b2c3d4e5f6a7b8c9d1" // optional, for replies
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Comment created successfully",
  "comment": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "post": "64f8a1b2c3d4e5f6a7b8c9d0",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "username": "john_doe",
      "profileImage": "https://example.com/profile.jpg"
    },
    "content": "Great post! Thanks for sharing.",
    "media": "https://example.com/image.jpg",
    "parentId": null,
    "likesCount": 0,
    "reactions": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Comments by Post
**GET** `/api/comments/post/:postId`

Retrieves all comments for a specific post with pagination and sorting options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of comments per page (default: 10)
- `sort` (optional): Sort order - "newest", "oldest", "mostLiked" (default: "newest")

**Example:**
```
GET /api/comments/post/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=5&sort=newest
```

**Response (200):**
```json
{
  "status": "success",
  "comments": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "post": "64f8a1b2c3d4e5f6a7b8c9d0",
      "user": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "username": "john_doe",
        "profileImage": "https://example.com/profile.jpg"
      },
      "content": "Great post!",
      "media": null,
      "parentId": null,
      "likesCount": 5,
      "reactions": [...],
      "replyCount": 3,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalComments": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Comment by ID
**GET** `/api/comments/:commentId`

Retrieves a specific comment by its ID.

**Response (200):**
```json
{
  "status": "success",
  "comment": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "post": "64f8a1b2c3d4e5f6a7b8c9d0",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "username": "john_doe",
      "profileImage": "https://example.com/profile.jpg"
    },
    "content": "Great post!",
    "media": null,
    "parentId": null,
    "likesCount": 5,
    "reactions": [...],
    "replyCount": 3,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Comment
**PUT** `/api/comments/:commentId`

Updates an existing comment. Only the comment owner can update it.

**Request Body:**
```json
{
  "content": "Updated comment content",
  "media": "https://example.com/new-image.jpg" // optional
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Comment updated successfully",
  "comment": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "content": "Updated comment content",
    "media": "https://example.com/new-image.jpg",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "username": "john_doe",
      "profileImage": "https://example.com/profile.jpg"
    },
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### 5. Delete Comment
**DELETE** `/api/comments/:commentId`

Deletes a comment and all its replies. Only the comment owner can delete it.

**Response (200):**
```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

### 6. Like Comment
**POST** `/api/comments/:commentId/like`

Adds a like reaction to a comment.

**Response (200):**
```json
{
  "status": "success",
  "message": "Comment liked successfully"
}
```

### 7. Unlike Comment
**DELETE** `/api/comments/:commentId/like`

Removes a like reaction from a comment.

**Response (200):**
```json
{
  "status": "success",
  "message": "Comment unliked successfully"
}
```

### 8. Get Comment Replies
**GET** `/api/comments/:commentId/replies`

Retrieves all replies to a specific comment.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of replies per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "replies": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "post": "64f8a1b2c3d4e5f6a7b8c9d0",
      "user": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "username": "jane_smith",
        "profileImage": "https://example.com/jane.jpg"
      },
      "content": "I agree with you!",
      "parentId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "likesCount": 2,
      "reactions": [...],
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalReplies": 3,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "failure",
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": "failure",
  "error": "You can only update your own comments"
}
```

### 404 Not Found
```json
{
  "status": "failure",
  "error": "Comment not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "failure",
  "error": "Internal server error",
  "message": "Error details"
}
```

## Features

### Nested Comments
- Comments can have replies (nested comments)
- Use `parentId` when creating a comment to make it a reply
- Get replies using the `/replies` endpoint

### Reactions
- Comments support emoji reactions
- Currently supports like/unlike functionality
- Reaction count is tracked in `likesCount`

### Pagination
- All list endpoints support pagination
- Configurable page size and page number
- Pagination metadata included in responses

### Sorting
- Comments can be sorted by:
  - `newest`: Most recent first (default)
  - `oldest`: Oldest first
  - `mostLiked`: Most liked first

### Authorization
- Users can only update/delete their own comments
- All endpoints require authentication
- Proper error handling for unauthorized actions

## Database Schema

```javascript
{
  post: ObjectId,        // Reference to Post
  user: ObjectId,        // Reference to User
  content: String,       // Comment text
  media: String,         // Optional media URL
  parentId: ObjectId,    // Reference to parent comment (for replies)
  likesCount: Number,    // Number of reactions
  reactions: [           // Array of user reactions
    {
      user: ObjectId,
      emoji: String,
      reactedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
``` 