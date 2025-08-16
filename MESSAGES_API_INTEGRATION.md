# Messages API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Messages API endpoints, including real-time messaging and seen indicators.

## 🚀 Base URL
```
http://localhost:3000/api/messages
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

### 1. **Send Message**
- **Endpoint**: `POST /api/messages`
- **Description**: Send a private message to another user
- **Body**:
  ```json
  {
    "receiverId": "user_id",
    "message": "Hello! How are you?"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Message sent successfully",
    "data": {
      "_id": "message_id",
      "sender": {
        "_id": "sender_id",
        "username": "sender_username",
        "profileImage": "profile_image_url"
      },
      "receiver": {
        "_id": "receiver_id",
        "username": "receiver_username",
        "profileImage": "profile_image_url"
      },
      "message": "Hello! How are you?",
      "isRead": false,
      "seenBy": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Get Chat History**
- **Endpoint**: `GET /api/messages/:userId`
- **Description**: Get chat history between current user and another user
- **Path Parameters**: `userId` - ID of the other user
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Messages per page (default: 50)
  - `markAsSeen` (optional): Mark messages as seen (default: true)
- **Response**:
  ```json
  {
    "status": "success",
    "messages": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalMessages": 150,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 3. **Get Conversations**
- **Endpoint**: `GET /api/messages`
- **Description**: Get all conversations for current user
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Conversations per page (default: 20)
- **Response**:
  ```json
  {
    "status": "success",
    "conversations": [
      {
        "user": {
          "_id": "user_id",
          "username": "username",
          "profileImage": "profile_image_url"
        },
        "lastMessage": {
          "_id": "message_id",
          "message": "Last message content",
          "sender": "sender_id",
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "unreadCount": 3
      }
    ],
    "pagination": {...}
  }
  ```

### 4. **Mark Message as Read**
- **Endpoint**: `PATCH /api/messages/:messageId/read`
- **Description**: Mark a specific message as read
- **Path Parameters**: `messageId` - ID of the message
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Message marked as read",
    "notification": {...}
  }
  ```

### 5. **Delete Message**
- **Endpoint**: `DELETE /api/messages/:messageId`
- **Description**: Delete a message (only by sender)
- **Path Parameters**: `messageId` - ID of the message
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Message deleted successfully"
  }
  ```

### 6. **Mark Message as Seen**
- **Endpoint**: `PATCH /api/messages/:messageId/seen`
- **Description**: Mark a specific message as seen by current user
- **Path Parameters**: `messageId` - ID of the message
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Message marked as seen",
    "seenBy": [...],
    "isRead": true
  }
  ```

### 7. **Mark Conversation as Seen**
- **Endpoint**: `PATCH /api/conversation/:userId/seen`
- **Description**: Mark all unread messages in a conversation as seen
- **Path Parameters**: `userId` - ID of the other user
- **Response**:
  ```json
  {
    "status": "success",
    "message": "All messages marked as seen",
    "updatedCount": 5
  }
  ```

## 📊 Message Object Structure

```javascript
{
  "_id": "message_id",
  "sender": {
    "_id": "sender_id",
    "username": "sender_username",
    "profileImage": "profile_image_url"
  },
  "receiver": {
    "_id": "receiver_id",
    "username": "receiver_username",
    "profileImage": "profile_image_url"
  },
  "message": "Message content text",
  "isRead": false,
  "seenBy": [
    {
      "userId": "user_id",
      "seenAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of items per page

### Message History
- `markAsSeen`: Boolean to automatically mark messages as seen (default: true)

## 🚨 Error Handling

### Common Error Responses

#### 404 - Message/User Not Found
```json
{
  "status": "failure",
  "error": "Message not found"
}
```

#### 403 - Access Denied
```json
{
  "status": "failure",
  "error": "You can only delete your own messages"
}
```

#### 400 - Validation Error
```json
{
  "status": "failure",
  "error": "Message content is required"
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

### React Hook for Messages
```javascript
import { useState, useEffect } from 'react';

const useMessages = (otherUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/${otherUserId}?page=${page}&markAsSeen=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.messages);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [otherUserId]);

  return { messages, loading, pagination, fetchMessages };
};
```

### Send Message Example
```javascript
const sendMessage = async (receiverId, messageText) => {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receiverId,
        message: messageText
      })
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Add message to local state
      setMessages(prev => [...prev, data.data]);
      return data.data;
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

### Mark Message as Seen Example
```javascript
const markMessageAsSeen = async (messageId) => {
  try {
    const response = await fetch(`/api/messages/${messageId}/seen`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // Update local message state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, isRead: true, seenBy: data.seenBy }
          : msg
      ));
    }
  } catch (error) {
    console.error('Error marking message as seen:', error);
  }
};
```

### Conversations List Example
```javascript
const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return { conversations, loading, fetchConversations };
};
```

## 🔄 Real-Time Updates via Socket.IO

### Connection Setup
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Message Events
```javascript
// Listen for new messages
socket.on('receive_message', (data) => {
  const { message, sender } = data;
  
  // Add to messages list if it's from the current conversation
  if (message.sender._id === currentConversationUserId) {
    setMessages(prev => [...prev, message]);
  }
  
  // Update conversations list
  updateConversationsList(message);
  
  // Show notification
  showMessageNotification(sender.username, message.message);
});

// Listen for message seen confirmations
socket.on('message_seen', (data) => {
  const { messageId, seenBy, seenAt, isRead } = data;
  
  // Update message in local state
  setMessages(prev => prev.map(msg => 
    msg._id === messageId 
      ? { ...msg, isRead, seenBy: [...msg.seenBy, { userId: seenBy, seenAt }] }
      : msg
  ));
});

// Listen for message read confirmations
socket.on('message_read_confirmation', (data) => {
  const { messageId, readBy, readAt } = data;
  
  // Update message read status
  setMessages(prev => prev.map(msg => 
    msg._id === messageId 
      ? { ...msg, isRead: true }
      : msg
  ));
});

// Listen for message deletions
socket.on('message_deleted', (data) => {
  const { messageId } = data;
  
  // Remove message from local state
  setMessages(prev => prev.filter(msg => msg._id !== messageId));
});
```

### Sending Messages via Socket
```javascript
// Send message via socket (alternative to REST API)
const sendMessageViaSocket = (receiverId, messageText) => {
  socket.emit('send_message', {
    receiverId,
    message: messageText
  });
};

// Listen for send confirmation
socket.on('message_sent', (data) => {
  if (data.status === 'success') {
    // Message was sent successfully
    console.log('Message sent:', data.message);
  }
});
```

### Typing Indicators
```javascript
// Start typing indicator
const startTyping = (receiverId) => {
  socket.emit('typing_start', { receiverId });
};

// Stop typing indicator
const stopTyping = (receiverId) => {
  socket.emit('typing_stop', { receiverId });
};

// Listen for typing indicators
socket.on('user_typing', (data) => {
  const { userId, username } = data;
  // Show typing indicator for this user
  showTypingIndicator(userId, username);
});

socket.on('user_stopped_typing', (data) => {
  const { userId } = data;
  // Hide typing indicator for this user
  hideTypingIndicator(userId);
});
```

## 📱 Mobile Considerations

### Message Loading
- Implement infinite scroll for chat history
- Use pull-to-refresh for new messages
- Cache messages locally for offline viewing

### Typing Indicators
- Debounce typing events to prevent spam
- Show typing indicators with user avatars
- Handle multiple users typing simultaneously

### Push Notifications
- Request notification permissions
- Handle notification clicks
- Show message previews in notifications

## 🧪 Testing

### Test Data
```javascript
const testMessage = {
  receiverId: "other_user_id",
  message: "This is a test message for development"
};
```

### Test Endpoints
1. Send a test message
2. Fetch chat history
3. Test seen indicators
4. Verify real-time updates
5. Test error handling

## 🔗 Related APIs

- **Users**: `/api/users` - User information
- **Notifications**: `/api/notifications` - Message notifications
- **Search**: `/api/search/users` - Find users to message

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Push Notifications](../PUSH_NOTIFICATIONS.md) 