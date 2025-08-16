# Follow API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Follow API endpoints for managing user relationships and friendships.

## 🚀 Base URL
```
http://localhost:3000/api/follow
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

### 1. **Follow User**
- **Endpoint**: `POST /api/follow/:userId`
- **Description**: Start following another user
- **Path Parameters**: `userId` - ID of the user to follow
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "User followed successfully",
    "follow": {
      "_id": "follow_id",
      "follower": "current_user_id",
      "following": {
        "_id": "target_user_id",
        "username": "target_username",
        "profileImage": "profile_image_url",
        "bio": "User bio"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Unfollow User**
- **Endpoint**: `DELETE /api/follow/:userId`
- **Description**: Stop following another user
- **Path Parameters**: `userId` - ID of the user to unfollow
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "User unfollowed successfully"
  }
  ```

### 3. **Get Followers**
- **Endpoint**: `GET /api/follow/followers`
- **Description**: Get list of users who follow the current user
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Followers per page (default: 20)
- **Response**:
  ```json
  {
    "status": "success",
    "followers": [
      {
        "_id": "follower_id",
        "follower": {
          "_id": "user_id",
          "username": "username",
          "profileImage": "profile_image_url",
          "bio": "User bio"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalFollowers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 4. **Get Following**
- **Endpoint**: `GET /api/follow/following`
- **Description**: Get list of users that the current user follows
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Following per page (default: 20)
- **Response**: Same structure as followers

### 5. **Get Friends (Mutual Follows)**
- **Endpoint**: `GET /api/follow/friends`
- **Description**: Get list of mutual friends (users who follow each other)
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Friends per page (default: 20)
- **Response**: Same structure as followers

### 6. **Check Follow Status**
- **Endpoint**: `GET /api/follow/:userId/status`
- **Description**: Check follow relationship status between current user and another user
- **Path Parameters**: `userId` - ID of the other user
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "followStatus": {
      "isFollowing": true,
      "isFollowedBy": false,
      "isFriend": false
    }
  }
  ```

## 📊 Follow Object Structure

```javascript
{
  "_id": "follow_id",
  "follower": {
    "_id": "follower_user_id",
    "username": "follower_username",
    "profileImage": "profile_image_url",
    "bio": "User bio"
  },
  "following": {
    "_id": "following_user_id",
    "username": "following_username",
    "profileImage": "profile_image_url",
    "bio": "User bio"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 50)

### Follow Status Values
- `isFollowing`: Boolean - Current user follows the other user
- `isFollowedBy`: Boolean - Other user follows current user
- `isFriend`: Boolean - Both users follow each other (mutual)

## 🚨 Error Handling

### Common Error Responses

#### 404 - User Not Found
```json
{
  "status": "failure",
  "error": "User not found"
}
```

#### 400 - Already Following
```json
{
  "status": "failure",
  "error": "You are already following this user"
}
```

#### 400 - Self Follow
```json
{
  "status": "failure",
  "error": "You cannot follow yourself"
}
```

#### 404 - Follow Relationship Not Found
```json
{
  "status": "failure",
  "error": "Follow relationship not found"
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

### React Hook for Follow Status
```javascript
import { useState, useEffect } from 'react';

const useFollowStatus = (userId) => {
  const [followStatus, setFollowStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFollowStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/follow/${userId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setFollowStatus(data.followStatus);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowStatus();
  }, [userId]);

  return { followStatus, loading, fetchFollowStatus };
};
```

### Follow/Unfollow User Example
```javascript
const toggleFollow = async (userId, isFollowing) => {
  try {
    const method = isFollowing ? 'DELETE' : 'POST';
    const response = await fetch(`/api/follow/${userId}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      setFollowStatus(prev => ({
        ...prev,
        isFollowing: !isFollowing
      }));
      
      // Update UI
      updateFollowButton(userId, !isFollowing);
      
      return !isFollowing;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
  }
};

// Usage
const handleFollowClick = async () => {
  const newStatus = await toggleFollow(userId, followStatus.isFollowing);
  if (newStatus) {
    showSuccessMessage('User followed successfully');
  } else {
    showSuccessMessage('User unfollowed successfully');
  }
};
```

### Followers List Hook
```javascript
const useFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchFollowers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/follow/followers?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setFollowers(data.followers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  return { followers, loading, pagination, fetchFollowers };
};
```

### Following List Hook
```javascript
const useFollowing = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchFollowing = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/follow/following?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setFollowing(data.following);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  return { following, loading, pagination, fetchFollowing };
};
```

### Friends List Hook
```javascript
const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchFriends = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/follow/friends?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setFriends(data.friends);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return { friends, loading, pagination, fetchFriends };
};
```

## 🔄 Real-Time Updates via Socket.IO

### Follow Events
```javascript
// Listen for new follow notifications
socket.on('new_notification', (data) => {
  if (data.type === 'new_follow') {
    const { fromUser, message } = data;
    
    // Show notification
    showNotification(message, fromUser);
    
    // Update followers count
    updateFollowersCount();
  }
});
```

### Follow Status Updates
```javascript
// Update follow button when status changes
const updateFollowButton = (userId, isFollowing) => {
  const followButton = document.querySelector(`[data-user-id="${userId}"] .follow-btn`);
  if (followButton) {
    followButton.textContent = isFollowing ? 'Unfollow' : 'Follow';
    followButton.classList.toggle('following', isFollowing);
  }
};

// Listen for follow status changes
socket.on('follow_status_changed', (data) => {
  const { userId, isFollowing } = data;
  updateFollowButton(userId, isFollowing);
});
```

## 📱 Mobile Considerations

### Follow Button States
- Show loading state during follow/unfollow
- Implement optimistic updates
- Handle offline scenarios gracefully

### Lists Performance
- Implement virtual scrolling for large lists
- Use pull-to-refresh for updates
- Cache follow relationships locally

### User Experience
- Show follow suggestions
- Implement follow back prompts
- Display mutual friends count

## 🧪 Testing

### Test Data
```javascript
const testFollowData = {
  userId: "target_user_id",
  expectedStatus: true
};
```

### Test Endpoints
1. Follow a user
2. Check follow status
3. Unfollow a user
4. Fetch followers/following lists
5. Test pagination
6. Verify real-time updates

## 🔗 Related APIs

- **Users**: `/api/users/:userId` - User profiles
- **Posts**: `/api/posts/user/:userId` - User's posts
- **Notifications**: `/api/notifications` - Follow notifications
- **Search**: `/api/search/users` - Find users to follow

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Push Notifications](../PUSH_NOTIFICATIONS.md) 