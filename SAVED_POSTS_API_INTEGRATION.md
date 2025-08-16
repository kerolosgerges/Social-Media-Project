# Saved Posts API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Saved Posts API endpoints for managing user's saved content.

## 🚀 Base URL
```
http://localhost:3000/api/saved-posts
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

### 1. **Save Post**
- **Endpoint**: `POST /api/saved-posts/:postId`
- **Description**: Save a post to user's saved collection
- **Path Parameters**: `postId` - ID of the post to save
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Post saved successfully",
    "savedPost": {
      "_id": "saved_post_id",
      "user": "current_user_id",
      "post": {
        "_id": "post_id",
        "content": "Post content",
        "user": {
          "_id": "post_user_id",
          "username": "username",
          "profileImage": "profile_image_url"
        },
        "media": ["media_url1", "media_url2"],
        "tags": ["#tag1", "#tag2"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "savedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Unsave Post**
- **Endpoint**: `DELETE /api/saved-posts/:postId`
- **Description**: Remove a post from user's saved collection
- **Path Parameters**: `postId` - ID of the post to unsave
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Post removed from saved collection"
  }
  ```

### 3. **Get Saved Posts**
- **Endpoint**: `GET /api/saved-posts`
- **Description**: Get all saved posts for the current user
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Posts per page (default: 20)
- **Response**:
  ```json
  {
    "status": "success",
    "savedPosts": [
      {
        "_id": "saved_post_id",
        "user": "current_user_id",
        "post": {
          "_id": "post_id",
          "content": "Post content",
          "user": {
            "_id": "post_user_id",
            "username": "username",
            "profileImage": "profile_image_url"
          },
          "media": ["media_url1", "media_url2"],
          "tags": ["#tag1", "#tag2"],
          "likesCount": 10,
          "commentsCount": 5,
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "savedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSavedPosts": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 4. **Check if Post is Saved**
- **Endpoint**: `GET /api/saved-posts/:postId/check`
- **Description**: Check if a specific post is saved by the current user
- **Path Parameters**: `postId` - ID of the post to check
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "isSaved": true,
    "savedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

## 📊 Saved Post Object Structure

```javascript
{
  "_id": "saved_post_id",
  "user": "current_user_id",
  "post": {
    "_id": "post_id",
    "content": "Post content text",
    "user": {
      "_id": "post_user_id",
      "username": "username",
      "profileImage": "profile_image_url"
    },
    "media": ["media_url1", "media_url2"],
    "thumbnail": "thumbnail_url",
    "tags": ["#tag1", "#tag2"],
    "likesCount": 10,
    "commentsCount": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "savedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of saved posts per page (max 50)

## 🚨 Error Handling

### Common Error Responses

#### 404 - Post Not Found
```json
{
  "status": "failure",
  "error": "Post not found"
}
```

#### 400 - Already Saved
```json
{
  "status": "failure",
  "error": "Post is already saved"
}
```

#### 404 - Saved Post Not Found
```json
{
  "status": "failure",
  "error": "Saved post not found"
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

### React Hook for Saved Posts
```javascript
import { useState, useEffect } from 'react';

const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchSavedPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-posts?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSavedPosts(data.savedPosts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return { savedPosts, loading, pagination, fetchSavedPosts };
};
```

### Save/Unsave Post Example
```javascript
const toggleSavePost = async (postId, isCurrentlySaved) => {
  try {
    const method = isCurrentlySaved ? 'DELETE' : 'POST';
    const response = await fetch(`/api/saved-posts/${postId}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      if (isCurrentlySaved) {
        // Remove from saved posts
        setSavedPosts(prev => prev.filter(sp => sp.post._id !== postId));
      } else {
        // Add to saved posts
        setSavedPosts(prev => [data.savedPost, ...prev]);
      }
      
      return !isCurrentlySaved;
    }
  } catch (error) {
    console.error('Error toggling save post:', error);
  }
};

// Usage
const handleSaveClick = async () => {
  const newStatus = await toggleSavePost(postId, isSaved);
  if (newStatus) {
    showSuccessMessage('Post saved successfully');
  } else {
    showSuccessMessage('Post removed from saved collection');
  }
};
```

### Check Saved Status Hook
```javascript
const useSavedStatus = (postId) => {
  const [isSaved, setIsSaved] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkSavedStatus = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-posts/${postId}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsSaved(data.isSaved);
        setSavedAt(data.savedAt);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSavedStatus();
  }, [postId]);

  return { isSaved, savedAt, loading, checkSavedStatus };
};
```

### Saved Posts List Component
```javascript
const SavedPostsList = () => {
  const { savedPosts, loading, pagination, fetchSavedPosts } = useSavedPosts();

  const handleUnsave = async (postId) => {
    try {
      const response = await fetch(`/api/saved-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Remove from local state
        setSavedPosts(prev => prev.filter(sp => sp.post._id !== postId));
        showSuccessMessage('Post removed from saved collection');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
  };

  if (loading) return <div>Loading saved posts...</div>;

  return (
    <div className="saved-posts-container">
      <h2>Saved Posts ({pagination.totalSavedPosts || 0})</h2>
      
      {savedPosts.length === 0 ? (
        <div className="no-saved-posts">
          <p>You haven't saved any posts yet.</p>
          <p>Save interesting posts to view them here later!</p>
        </div>
      ) : (
        <div className="saved-posts-grid">
          {savedPosts.map(savedPost => (
            <div key={savedPost._id} className="saved-post-card">
              <div className="post-header">
                <img 
                  src={savedPost.post.user.profileImage || '/default-avatar.png'} 
                  alt={savedPost.post.user.username}
                  className="user-avatar"
                />
                <span className="username">{savedPost.post.user.username}</span>
                <span className="saved-date">
                  Saved {new Date(savedPost.savedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="post-content">
                <p>{savedPost.post.content}</p>
                {savedPost.post.media.length > 0 && (
                  <div className="post-media">
                    <img src={savedPost.post.media[0]} alt="Post media" />
                  </div>
                )}
                {savedPost.post.tags.length > 0 && (
                  <div className="post-tags">
                    {savedPost.post.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="post-actions">
                <button 
                  onClick={() => handleUnsave(savedPost.post._id)}
                  className="unsave-btn"
                >
                  Remove from Saved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.hasNext && (
        <button 
          onClick={() => fetchSavedPosts(pagination.currentPage + 1)}
          className="load-more-btn"
        >
          Load More
        </button>
      )}
    </div>
  );
};
```

### Save Button Component
```javascript
const SaveButton = ({ postId, isSaved, onSaveToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSaveToggle(postId, isSaved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`save-btn ${isSaved ? 'saved' : ''}`}
      title={isSaved ? 'Remove from saved' : 'Save post'}
    >
      {loading ? (
        <span className="loading-spinner">⏳</span>
      ) : isSaved ? (
        <span className="saved-icon">🔖</span>
      ) : (
        <span className="save-icon">📖</span>
      )}
      <span className="btn-text">
        {isSaved ? 'Saved' : 'Save'}
      </span>
    </button>
  );
};
```

## 🔄 Real-Time Updates via Socket.IO

### Save Status Updates
```javascript
// Listen for post save/unsave events
socket.on('post_saved', (data) => {
  const { postId, userId } = data;
  
  // Update save button if it's the current user
  if (userId === currentUserId) {
    updateSaveButton(postId, true);
  }
});

socket.on('post_unsaved', (data) => {
  const { postId, userId } = data;
  
  // Update save button if it's the current user
  if (userId === currentUserId) {
    updateSaveButton(postId, false);
  }
});

// Update save button state
const updateSaveButton = (postId, isSaved) => {
  const saveBtn = document.querySelector(`[data-post-id="${postId}"] .save-btn`);
  if (saveBtn) {
    saveBtn.classList.toggle('saved', isSaved);
    saveBtn.querySelector('.btn-text').textContent = isSaved ? 'Saved' : 'Save';
  }
};
```

## 📱 Mobile Considerations

### Save Button UX
- Use appropriate touch targets
- Show save confirmation
- Implement save animations
- Support offline saving

### Performance
- Cache saved posts locally
- Implement lazy loading
- Use pull-to-refresh
- Optimize image loading

### User Experience
- Show save collections
- Allow organizing saved posts
- Support search within saved posts
- Implement save reminders

## 🧪 Testing

### Test Data
```javascript
const testSavedPost = {
  postId: "test_post_id",
  expectedResponse: "Post saved successfully"
};
```

### Test Scenarios
1. Save a post
2. Check saved status
3. Unsave a post
4. Fetch saved posts list
5. Test pagination
6. Verify real-time updates
7. Test error handling

## 🔗 Related APIs

- **Posts**: `/api/posts/:postId` - Post details
- **Users**: `/api/users/:userId` - User profiles
- **Search**: `/api/search/posts` - Find posts to save
- **Collections**: `/api/collections` - Organize saved posts

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [User Management](../USERS_API_INTEGRATION.md) 