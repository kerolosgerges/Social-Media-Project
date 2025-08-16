# Users API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Users API endpoints, including user profiles, status, and management.

## 🚀 Base URL
```
http://localhost:3000/api/users
```

## 📋 Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 🔗 API Endpoints

### 1. **Get User Profile**
- **Endpoint**: `GET /api/users/:userId`
- **Description**: Get detailed user profile information
- **Path Parameters**: `userId` - ID of the user
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "profileImage": "profile_image_url",
      "coverImage": "cover_image_url",
      "bio": "User bio text",
      "status": "Available",
      "moodStatus": "Happy",
      "phone": "+1234567890",
      "address": "User address",
      "birthday": "1990-01-01T00:00:00.000Z",
      "gender": "male",
      "isVerified": true,
      "role": "user",
      "socialLinks": {
        "facebook": "facebook_url",
        "instagram": "instagram_url",
        "twitter": "twitter_url",
        "github": "github_url",
        "linkedin": "linkedin_url"
      },
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Update User Profile**
- **Endpoint**: `PATCH /api/users/:userId`
- **Description**: Update user profile information (only by user owner)
- **Path Parameters**: `userId` - ID of the user
- **Authentication**: Required
- **Body** (all fields optional):
  ```json
  {
    "username": "new_username",
    "bio": "Updated bio",
    "status": "Busy",
    "moodStatus": "Working",
    "phone": "+1234567890",
    "address": "New address",
    "birthday": "1990-01-01T00:00:00.000Z",
    "gender": "male",
    "socialLinks": {
      "facebook": "facebook_url",
      "instagram": "instagram_url"
    }
  }
  ```
- **Response**: Updated user object

### 3. **Get User Status**
- **Endpoint**: `GET /api/users/:userId/status`
- **Description**: Get user's online status and last seen information
- **Path Parameters**: `userId` - ID of the user
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "userStatus": {
      "userId": "user_id",
      "username": "username",
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "status": "online",
      "lastSeenText": "Just now"
    }
  }
  ```

### 4. **Update User Status**
- **Endpoint**: `PATCH /api/users/status`
- **Description**: Update current user's status
- **Authentication**: Required
- **Body**:
  ```json
  {
    "status": "Available",
    "customStatus": "Working on project"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "User status updated successfully",
    "user": {
      "username": "username",
      "status": "Available",
      "customStatus": "Working on project"
    }
  }
  ```

### 5. **Delete User Account**
- **Endpoint**: `DELETE /api/users/:userId`
- **Description**: Delete user account (only by user owner)
- **Path Parameters**: `userId` - ID of the user
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "User account deleted successfully"
  }
  ```

### 6. **Get User Posts**
- **Endpoint**: `GET /api/users/:userId/posts`
- **Description**: Get posts by a specific user
- **Path Parameters**: `userId` - ID of the user
- **Authentication**: Required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Posts per page (default: 10)
- **Response**: Same structure as Posts API

## 📊 User Object Structure

```javascript
{
  "_id": "user_id",
  "username": "username",
  "email": "user@example.com",
  "profileImage": "profile_image_url",
  "coverImage": "cover_image_url",
  "bio": "User bio text",
  "status": "Available",
  "moodStatus": "Happy",
  "phone": "+1234567890",
  "address": "User address",
  "birthday": "1990-01-01T00:00:00.000Z",
  "gender": "male", // "male" | "female"
  "isVerified": true,
  "role": "user", // "user" | "admin" | "moderator"
  "socialLinks": {
    "facebook": "facebook_url",
    "instagram": "instagram_url",
    "twitter": "twitter_url",
    "github": "github_url",
    "linkedin": "linkedin_url"
  },
  "isOnline": true,
  "lastSeen": "2024-01-01T00:00:00.000Z",
  "pushSubscriptions": [...],
  "isActive": true,
  "isDeleted": false,
  "isBlocked": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 50)

### User Status Values
- `status`: "Available", "Busy", "Away", "Do Not Disturb"
- `gender`: "male", "female"
- `role`: "user", "admin", "moderator"

## 🚨 Error Handling

### Common Error Responses

#### 404 - User Not Found
```json
{
  "status": "failure",
  "error": "User not found"
}
```

#### 403 - Access Denied
```json
{
  "status": "failure",
  "error": "You can only update your own profile"
}
```

#### 400 - Validation Error
```json
{
  "status": "failure",
  "error": "Username must be at least 3 characters long"
}
```

#### 401 - Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

#### 409 - Conflict
```json
{
  "status": "failure",
  "error": "Username already exists"
}
```

## 💡 Frontend Integration Examples

### React Hook for User Profile
```javascript
import { useState, useEffect } from 'react';

const useUserProfile = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  return { user, loading, error, fetchUserProfile };
};
```

### Update Profile Example
```javascript
const updateProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      setUser(data.user);
      return data.user;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Usage
const updatedUser = await updateProfile(userId, {
  bio: 'New bio text',
  status: 'Available',
  socialLinks: {
    twitter: 'https://twitter.com/username'
  }
});
```

### User Status Hook
```javascript
const useUserStatus = (userId) => {
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setUserStatus(data.userStatus);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchUserStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { userStatus, loading, fetchUserStatus };
};
```

### Update Status Example
```javascript
const updateStatus = async (statusData) => {
  try {
    const response = await fetch('/api/users/status', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local state
      setUser(prev => ({ ...prev, ...data.user }));
      return data.user;
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
};

// Usage
await updateStatus({
  status: 'Busy',
  customStatus: 'In a meeting'
});
```

## 🔄 Real-Time Updates via Socket.IO

### Status Change Events
```javascript
// Listen for user status changes
socket.on('user_status_change', (data) => {
  const { userId, status, timestamp, lastSeen } = data;
  
  // Update user status in UI
  updateUserStatus(userId, { status, timestamp, lastSeen });
  
  // Show notification if status changed to online
  if (status === 'online') {
    showUserOnlineNotification(userId);
  }
});
```

### Online/Offline Status
```javascript
// Update user status when they come online
const handleUserOnline = (userId) => {
  setUsers(prev => prev.map(user => 
    user._id === userId 
      ? { ...user, isOnline: true, lastSeen: new Date() }
      : user
  ));
};

// Update user status when they go offline
const handleUserOffline = (userId, lastSeen) => {
  setUsers(prev => prev.map(user => 
    user._id === userId 
      ? { ...user, isOnline: false, lastSeen }
      : user
  ));
};

// Listen for status changes
socket.on('user_status_change', (data) => {
  if (data.status === 'online') {
    handleUserOnline(data.userId);
  } else if (data.status === 'offline') {
    handleUserOffline(data.userId, data.lastSeen);
  }
});
```

## 📱 Mobile Considerations

### Profile Images
- Implement image compression before upload
- Use different image sizes for different screen densities
- Implement lazy loading for profile images

### Status Updates
- Debounce status update requests
- Show status change indicators
- Cache user status locally

### Offline Support
- Cache user profiles locally
- Queue profile updates when offline
- Sync changes when connection is restored

## 🧪 Testing

### Test Data
```javascript
const testProfileUpdate = {
  bio: "This is a test bio update",
  status: "Available",
  socialLinks: {
    twitter: "https://twitter.com/testuser"
  }
};
```

### Test Endpoints
1. Fetch user profile
2. Update profile information
3. Test status updates
4. Verify real-time status changes
5. Test error handling with invalid data

## 🔗 Related APIs

- **Posts**: `/api/posts/user/:userId` - User's posts
- **Follow**: `/api/follow` - Follow/unfollow users
- **Messages**: `/api/messages` - Direct messaging
- **Search**: `/api/search/users` - Search for users

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Push Notifications](../PUSH_NOTIFICATIONS.md) 