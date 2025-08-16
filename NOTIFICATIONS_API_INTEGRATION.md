# Notifications API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Notifications API endpoints, including real-time notifications and push notifications.

## 🚀 Base URL
```
http://localhost:3000/api/notifications
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

### 1. **Get User Notifications**
- **Endpoint**: `GET /api/notifications`
- **Description**: Get all notifications for the current user
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Notifications per page (default: 20)
  - `type` (optional): Filter by notification type
  - `isRead` (optional): Filter by read status (true/false)
- **Response**:
  ```json
  {
    "status": "success",
    "notifications": [
      {
        "_id": "notification_id",
        "userId": "user_id",
        "type": "new_follow",
        "fromUser": {
          "_id": "from_user_id",
          "username": "username",
          "profileImage": "profile_image_url"
        },
        "postId": "post_id",
        "message": "username started following you",
        "isRead": false,
        "metadata": {
          "action": "follow",
          "timestamp": "2024-01-01T00:00:00.000Z"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalNotifications": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 2. **Mark Notification as Read**
- **Endpoint**: `PATCH /api/notifications/:notificationId/read`
- **Description**: Mark a specific notification as read
- **Path Parameters**: `notificationId` - ID of the notification
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Notification marked as read",
    "notification": {
      "_id": "notification_id",
      "isRead": true,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 3. **Mark All Notifications as Read**
- **Endpoint**: `PATCH /api/notifications/read-all`
- **Description**: Mark all notifications as read
- **Response**:
  ```json
  {
    "status": "success",
    "message": "All notifications marked as read",
    "updatedCount": 15
  }
  ```

### 4. **Delete Notification**
- **Endpoint**: `DELETE /api/notifications/:notificationId`
- **Description**: Delete a specific notification
- **Path Parameters**: `notificationId` - ID of the notification
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Notification deleted successfully"
  }
  ```

### 5. **Delete All Notifications**
- **Endpoint**: `DELETE /api/notifications/delete-all`
- **Description**: Delete all notifications for the current user
- **Response**:
  ```json
  {
    "status": "success",
    "message": "All notifications deleted successfully",
    "deletedCount": 25
  }
  ```

### 6. **Subscribe to Push Notifications**
- **Endpoint**: `POST /api/notifications/subscribe`
- **Description**: Subscribe to browser push notifications
- **Body**:
  ```json
  {
    "endpoint": "push_subscription_endpoint",
    "keys": {
      "p256dh": "p256dh_key",
      "auth": "auth_key"
    }
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Successfully subscribed to push notifications"
  }
  ```

### 7. **Unsubscribe from Push Notifications**
- **Endpoint**: `DELETE /api/notifications/unsubscribe`
- **Description**: Unsubscribe from push notifications
- **Query Parameters**:
  - `endpoint` (optional): Specific endpoint to unsubscribe from
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Successfully unsubscribed from push notifications"
  }
  ```

### 8. **Get VAPID Public Key**
- **Endpoint**: `GET /api/notifications/vapid-key`
- **Description**: Get VAPID public key for push notification setup
- **Response**:
  ```json
  {
    "status": "success",
    "vapidPublicKey": "vapid_public_key_string"
  }
  ```

## 📊 Notification Object Structure

```javascript
{
  "_id": "notification_id",
  "userId": "user_id",
  "type": "new_follow", // new_follow, new_reaction, new_message, new_comment
  "fromUser": {
    "_id": "from_user_id",
    "username": "username",
    "profileImage": "profile_image_url"
  },
  "postId": "post_id", // optional, for post-related notifications
  "message": "Notification message text",
  "isRead": false,
  "metadata": {
    "action": "follow",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "additionalData": "extra information"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔔 Notification Types

| Type | Description | Triggers |
|------|-------------|----------|
| `new_follow` | New follower | User follows current user |
| `new_reaction` | New reaction on post | User reacts to current user's post |
| `new_message` | New direct message | User sends message to current user |
| `new_comment` | New comment on post | User comments on current user's post |
| `post_like` | Post liked | User likes current user's post |
| `mention` | User mentioned | User mentions current user in post/comment |

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of notifications per page (max 50)

### Filters
- `type`: Filter by notification type
- `isRead`: Filter by read status (true/false)

## 🚨 Error Handling

### Common Error Responses

#### 404 - Notification Not Found
```json
{
  "status": "failure",
  "error": "Notification not found"
}
```

#### 400 - Invalid Push Subscription
```json
{
  "status": "failure",
  "error": "Invalid push subscription data"
}
```

#### 401 - Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

#### 500 - Push Notification Error
```json
{
  "status": "failure",
  "error": "Failed to send push notification"
}
```

## 💡 Frontend Integration Examples

### React Hook for Notifications
```javascript
import { useState, useEffect } from 'react';

const useNotifications = (filters = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      });

      const response = await fetch(`/api/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setNotifications(data.notifications);
        setPagination(data.pagination);
        
        // Calculate unread count
        const unread = data.notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  return { notifications, loading, pagination, unreadCount, fetchNotifications };
};
```

### Notification List Component
```javascript
const NotificationList = () => {
  const { notifications, loading, pagination, unreadCount, fetchNotifications } = useNotifications();

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update local state
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update all notifications as read
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications ({unreadCount} unread)</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map(notification => (
          <div 
            key={notification._id} 
            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => markAsRead(notification._id)}
          >
            <img 
              src={notification.fromUser.profileImage || '/default-avatar.png'} 
              alt={notification.fromUser.username}
              className="notification-avatar"
            />
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              <span className="notification-time">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
            {!notification.isRead && <div className="unread-indicator" />}
          </div>
        ))}
      </div>

      {pagination.hasNext && (
        <button 
          onClick={() => fetchNotifications(pagination.currentPage + 1)}
          className="load-more-btn"
        >
          Load More
        </button>
      )}
    </div>
  );
};
```

### Push Notification Setup
```javascript
const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const subscribeToPushNotifications = async () => {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get VAPID public key
      const vapidResponse = await fetch('/api/notifications/vapid-key');
      const vapidData = await vapidResponse.json();
      const vapidPublicKey = vapidData.vapidPublicKey;

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(pushSubscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(pushSubscription.getKey('auth'))))
          }
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setSubscription(pushSubscription);
        console.log('Successfully subscribed to push notifications');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        const response = await fetch('/api/notifications/unsubscribe', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsSubscribed(false);
          setSubscription(null);
          console.log('Successfully unsubscribed from push notifications');
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  return {
    isSubscribed,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
  };
};
```

### Push Notification Component
```javascript
const PushNotificationToggle = () => {
  const { isSubscribed, subscribeToPushNotifications, unsubscribeFromPushNotifications } = usePushNotifications();

  return (
    <div className="push-notification-toggle">
      <h3>Push Notifications</h3>
      <p>Receive notifications even when the app is closed</p>
      
      {isSubscribed ? (
        <button 
          onClick={unsubscribeFromPushNotifications}
          className="unsubscribe-btn"
        >
          Disable Push Notifications
        </button>
      ) : (
        <button 
          onClick={subscribeToPushNotifications}
          className="subscribe-btn"
        >
          Enable Push Notifications
        </button>
      )}
    </div>
  );
};
```

## 🔄 Real-Time Updates via Socket.IO

### Notification Events
```javascript
// Listen for new notifications
socket.on('new_notification', (data) => {
  const { notification, fromUser } = data;
  
  // Add to notifications list
  setNotifications(prev => [notification, ...prev]);
  
  // Update unread count
  setUnreadCount(prev => prev + 1);
  
  // Show browser notification if enabled
  if (Notification.permission === 'granted') {
    new Notification(notification.message, {
      icon: fromUser.profileImage || '/default-avatar.png',
      body: `From: ${fromUser.username}`,
      tag: notification._id
    });
  }
  
  // Show in-app notification toast
  showNotificationToast(notification);
});

// Listen for notification updates
socket.on('notification_updated', (data) => {
  const { notificationId, updates } = data;
  
  // Update notification in local state
  setNotifications(prev => prev.map(n => 
    n._id === notificationId ? { ...n, ...updates } : n
  ));
});
```

## 📱 Mobile Considerations

### Push Notifications
- Request permissions on app launch
- Handle notification clicks
- Show notification badges
- Support notification actions

### Performance
- Implement notification pagination
- Cache notifications locally
- Use pull-to-refresh
- Implement infinite scroll

### User Experience
- Group similar notifications
- Allow notification preferences
- Show notification history
- Support notification search

## 🧪 Testing

### Test Data
```javascript
const testNotification = {
  type: "new_follow",
  fromUser: "test_user_id",
  message: "Test notification message"
};
```

### Test Scenarios
1. Create test notifications
2. Test mark as read functionality
3. Verify push notification delivery
4. Test notification deletion
5. Check real-time updates
6. Test notification filters

## 🔗 Related APIs

- **Users**: `/api/users/:userId` - User profiles
- **Posts**: `/api/posts/:postId` - Post details
- **Messages**: `/api/messages` - Message notifications
- **Follow**: `/api/follow` - Follow notifications

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Push Notifications Setup](../PUSH_NOTIFICATIONS.md) 