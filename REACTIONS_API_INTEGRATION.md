# Reactions API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Reactions API endpoints for managing post reactions and emotions.

## 🚀 Base URL
```
http://localhost:3000/api/reactions
```

## 📋 Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 🔗 API Endpoints

### 1. **Add/Update Reaction**
- **Endpoint**: `POST /api/reactions/:postId`
- **Description**: Add a new reaction or update existing reaction to a post
- **Path Parameters**: `postId` - ID of the post
- **Body**:
  ```json
  {
    "type": "like"
  }
  ```
- **Reaction Types**: `like`, `love`, `haha`, `wow`, `sad`, `angry`
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Reaction added successfully",
    "reaction": {
      "_id": "reaction_id",
      "user": {
        "_id": "user_id",
        "username": "username",
        "profileImage": "profile_image_url"
      },
      "post": "post_id",
      "type": "like",
      "emoji": "👍",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Remove Reaction**
- **Endpoint**: `DELETE /api/reactions/:postId`
- **Description**: Remove user's reaction from a post
- **Path Parameters**: `postId` - ID of the post
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Reaction removed successfully"
  }
  ```

### 3. **Get Post Reactions**
- **Endpoint**: `GET /api/reactions/:postId`
- **Description**: Get all reactions for a specific post
- **Path Parameters**: `postId` - ID of the post
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Reactions per page (default: 20)
- **Response**:
  ```json
  {
    "status": "success",
    "reactions": [
      {
        "_id": "reaction_id",
        "user": {
          "_id": "user_id",
          "username": "username",
          "profileImage": "profile_image_url"
        },
        "post": "post_id",
        "type": "like",
        "emoji": "👍",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalReactions": 35,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 4. **Get Reaction Counts**
- **Endpoint**: `GET /api/reactions/:postId/counts`
- **Description**: Get count of each reaction type for a post
- **Path Parameters**: `postId` - ID of the post
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "counts": {
      "like": 15,
      "love": 8,
      "haha": 3,
      "wow": 2,
      "sad": 1,
      "angry": 0
    },
    "totalReactions": 29
  }
  ```

## 📊 Reaction Object Structure

```javascript
{
  "_id": "reaction_id",
  "user": {
    "_id": "user_id",
    "username": "username",
    "profileImage": "profile_image_url"
  },
  "post": "post_id",
  "type": "like", // like, love, haha, wow, sad, angry
  "emoji": "👍", // corresponding emoji
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🎭 Reaction Types and Emojis

| Type | Emoji | Description |
|------|-------|-------------|
| `like` | 👍 | Standard like/thumbs up |
| `love` | ❤️ | Heart/love reaction |
| `haha` | 😂 | Laughing reaction |
| `wow` | 😮 | Surprised/amazed reaction |
| `sad` | 😢 | Sad/disappointed reaction |
| `angry` | 😠 | Angry/upset reaction |

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of reactions per page (max 50)

## 🚨 Error Handling

### Common Error Responses

#### 404 - Post Not Found
```json
{
  "status": "failure",
  "error": "Post not found"
}
```

#### 400 - Already Reacted
```json
{
  "status": "failure",
  "error": "You are already following this user"
}
```

#### 404 - Reaction Not Found
```json
{
  "status": "failure",
  "error": "Reaction not found"
}
```

#### 400 - Invalid Reaction Type
```json
{
  "status": "failure",
  "error": "Invalid reaction type"
}
```

#### 401 - Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

## 💡 Frontend Integration Examples

### React Hook for Post Reactions
```javascript
import { useState, useEffect } from 'react';

const usePostReactions = (postId) => {
  const [reactions, setReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = async () => {
    setLoading(true);
    try {
      const [reactionsRes, countsRes] = await Promise.all([
        fetch(`/api/reactions/${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/reactions/${postId}/counts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const reactionsData = await reactionsRes.json();
      const countsData = await countsRes.json();

      if (reactionsData.status === 'success') {
        setReactions(reactionsData.reactions);
        // Find current user's reaction
        const currentUserReaction = reactionsData.reactions.find(
          r => r.user._id === currentUserId
        );
        setUserReaction(currentUserReaction);
      }

      if (countsData.status === 'success') {
        setReactionCounts(countsData.counts);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  return { reactions, reactionCounts, userReaction, loading, fetchReactions };
};
```

### Add/Update Reaction Example
```javascript
const addReaction = async (postId, reactionType) => {
  try {
    const response = await fetch(`/api/reactions/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: reactionType })
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      setUserReaction(data.reaction);
      
      // Refresh reactions and counts
      fetchReactions();
      
      return data.reaction;
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
  }
};

// Usage
const handleReactionClick = async (reactionType) => {
  if (userReaction && userReaction.type === reactionType) {
    // Remove reaction if clicking the same type
    await removeReaction(postId);
  } else {
    // Add/update reaction
    await addReaction(postId, reactionType);
  }
};
```

### Remove Reaction Example
```javascript
const removeReaction = async (postId) => {
  try {
    const response = await fetch(`/api/reactions/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      setUserReaction(null);
      
      // Refresh reactions and counts
      fetchReactions();
      
      return true;
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
  }
};
```

### Reaction Button Component
```javascript
const ReactionButton = ({ postId, reactionType, emoji, count, isActive, onClick }) => {
  return (
    <button
      className={`reaction-btn ${isActive ? 'active' : ''}`}
      onClick={() => onClick(reactionType)}
      title={`${reactionType} (${count})`}
    >
      <span className="emoji">{emoji}</span>
      <span className="count">{count}</span>
    </button>
  );
};

// Usage in Post Component
const PostReactions = ({ postId }) => {
  const { reactions, reactionCounts, userReaction, loading } = usePostReactions(postId);

  const handleReactionClick = async (reactionType) => {
    if (userReaction && userReaction.type === reactionType) {
      await removeReaction(postId);
    } else {
      await addReaction(postId, reactionType);
    }
  };

  if (loading) return <div>Loading reactions...</div>;

  return (
    <div className="post-reactions">
      {Object.entries(reactionCounts).map(([type, count]) => (
        <ReactionButton
          key={type}
          postId={postId}
          reactionType={type}
          emoji={getEmojiForType(type)}
          count={count}
          isActive={userReaction?.type === type}
          onClick={handleReactionClick}
        />
      ))}
    </div>
  );
};
```

## 🔄 Real-Time Updates via Socket.IO

### Reaction Events
```javascript
// Listen for new reactions
socket.on('new_notification', (data) => {
  if (data.type === 'new_reaction') {
    const { fromUser, postId, message } = data;
    
    // Show notification
    showNotification(message, fromUser);
    
    // Update reaction counts if it's the current post
    if (currentPostId === postId) {
      fetchReactions();
    }
  }
});
```

### Real-Time Reaction Updates
```javascript
// Update reaction counts in real-time
const updateReactionCounts = (postId, newCounts) => {
  setReactionCounts(prev => ({
    ...prev,
    ...newCounts
  }));
};

// Listen for reaction updates
socket.on('reaction_updated', (data) => {
  const { postId, reactionType, action } = data;
  
  if (currentPostId === postId) {
    // Update counts based on action
    if (action === 'added') {
      updateReactionCounts(postId, { [reactionType]: reactionCounts[reactionType] + 1 });
    } else if (action === 'removed') {
      updateReactionCounts(postId, { [reactionType]: reactionCounts[reactionType] - 1 });
    }
  }
});
```

## 📱 Mobile Considerations

### Touch Interactions
- Implement long-press for reaction options
- Use swipe gestures for quick reactions
- Show reaction preview on hover/touch

### Performance
- Lazy load reaction details
- Implement reaction caching
- Use optimistic updates for better UX

### Accessibility
- Add ARIA labels for reaction buttons
- Support keyboard navigation
- Provide alternative text for emojis

## 🧪 Testing

### Test Data
```javascript
const testReactionData = {
  postId: "post_id",
  reactionType: "like",
  expectedResponse: "Reaction added successfully"
};
```

### Test Endpoints
1. Add different reaction types
2. Update existing reactions
3. Remove reactions
4. Fetch reaction lists
5. Get reaction counts
6. Test pagination
7. Verify real-time updates

## 🔗 Related APIs

- **Posts**: `/api/posts/:postId` - Post information
- **Users**: `/api/users/:userId` - User profiles
- **Notifications**: `/api/notifications` - Reaction notifications
- **Search**: `/api/search/posts` - Search posts

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Push Notifications](../PUSH_NOTIFICATIONS.md) 