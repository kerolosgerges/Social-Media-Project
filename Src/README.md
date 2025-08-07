

### Post Visibility 

1. **Public** - Visible to everyone on the platform
2. **Private** - Visible only to the post owner
3. **Friends Only** - Visible only to users who are friends with the post owner
4. **Specific Users** - Visible only to selected users

### Backend Features

- **Enhanced Post Model**: Updated to support new visibility options
- **PostVisibility Model**: Tracks specific user permissions for posts
- **Advanced Visibility Logic**: Comprehensive checking system for post access
- **Updated API Endpoints**: All post endpoints now support visibility features
- **Validation**: Enhanced validation for visibility settings
- **Migration Script**: Safe migration from old privacy system to new visibility system

## Database Schema

### Post Model Updates

```javascript
{
  // ... existing fields
  visibility: {
    type: String,
    enum: ["Public", "Private", "FriendsOnly", "SpecificUsers"],
    default: "Public",
  },
  specificUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // ... other fields
}
```

### New PostVisibility Model

```javascript
{
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  allowedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedAt: { type: Date, default: Date.now },
}
```

## API Endpoints

### Create Post
```
POST /api/posts
{
  "content": "Post content",
  "visibility": "SpecificUsers",
  "specificUsers": ["userId1", "userId2"]
}
```

### Get Posts (with visibility filtering)
```
GET /api/posts?page=1&limit=10
```

### Update Post
```
PUT /api/posts/:postId
{
  "visibility": "FriendsOnly",
  "specificUsers": []
}
```

### Get My Posts
```
GET /api/posts/my?page=1&limit=10
```

### Get Posts by User
```
GET /api/posts/user/:userId?page=1&limit=10
```

### Get Specific Post
```
GET /api/posts/:postId
```

### Delete Post
```
DELETE /api/posts/:postId
```

### Like/Unlike Post
```
POST /api/posts/:postId/like
DELETE /api/posts/:postId/unlike
```

### Share Post
```
POST /api/posts/:postId/share
{
  "content": "Shared content",
  "visibility": "Public"
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and email settings
```

3. Run migration (if updating from old privacy system):
```bash
npm run migrate
```

4. Start the server:
```bash
npm run dev
```

## Usage

### Creating a Post with Visibility

```javascript

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    content: 'This is a private post',
    visibility: 'Private'
  })
});
```

### Visibility Logic

The backend automatically filters posts based on visibility:

- **Public posts**: Visible to all authenticated users
- **Private posts**: Only visible to the post owner
- **Friends Only posts**: Only visible to users who follow the post owner
- **Specific Users posts**: Only visible to users in the specificUsers array

### Error Responses

```javascript
{
  "status": "failure",
  "error": "Access denied"
}

{
  "status": "failure",
  "error": "Visibility must be 'Public', 'Private', 'FriendsOnly', or 'SpecificUsers'"
}

{
  "status": "failure",
  "error": "SpecificUsers visibility requires at least one user to be specified"
}
```

## Security Features

- **Access Control**: Server-side validation ensures users can only see posts they're authorized to view
- **Permission Tracking**: All specific user permissions are tracked with audit information
- **Validation**: Comprehensive validation for all visibility settings
- **Error Handling**: Proper error responses for unauthorized access attempts

## Migration

If you're updating from the old privacy system, run the migration script:

```bash
npm run migrate
```

This will:
1. Convert old `privacy` field values to new `visibility` values
2. Set default visibility for posts without privacy settings
3. Remove the old `privacy` field
4. Add empty `specificUsers` array for all posts

## Database Models

### Post Model
```javascript
import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  media: [{ type: String }],
  thumbnail: { type: String },
  mood: { type: String },
  tags: [{ type: String }],
  location: { type: String },
  visibility: {
    type: String,
    enum: ["Public", "Private", "FriendsOnly", "SpecificUsers"],
    default: "Public",
  },
  specificUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  postType: {
    type: String,
    enum: ["text", "image", "video", "audio", "poll", "link"],
    default: "text",
  },
  expiresAt: { type: Date },
  sharedPostId: { type: Schema.Types.ObjectId, ref: "Post" },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
}, { timestamps: true });
```

### PostVisibility Model
```javascript
import mongoose, { Schema } from "mongoose";

const PostVisibilitySchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  allowedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  grantedAt: { type: Date, default: Date.now },
}, { timestamps: true });

PostVisibilitySchema.index({ post: 1, allowedUser: 1 }, { unique: true });
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the ISC License. 