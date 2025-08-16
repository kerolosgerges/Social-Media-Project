# Socket.IO Client Integration Guide

This guide shows how to integrate Socket.IO on the client side to enable real-time communication.

## Installation

```bash
npm install socket.io-client
```

## Basic Connection Setup

```javascript
import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    // Connect to the server with authentication
    this.socket = io('http://localhost:3000', {
      auth: {
        token: token // JWT token from your auth system
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Initialize event listeners
    this.initializeEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  initializeEventListeners() {
    // Message events
    this.socket.on('receive_message', this.handleNewMessage.bind(this));
    this.socket.on('message_read_confirmation', this.handleMessageRead.bind(this));
    this.socket.on('message_deleted', this.handleMessageDeleted.bind(this));

    // Notification events
    this.socket.on('new_notification', this.handleNewNotification.bind(this));

    // Typing events
    this.socket.on('user_typing', this.handleUserTyping.bind(this));
    this.socket.on('user_stopped_typing', this.handleUserStoppedTyping.bind(this));

    // Status events
    this.socket.on('user_status_change', this.handleUserStatusChange.bind(this));
  }

  // Message methods
  sendMessage(receiverId, message) {
    if (this.isConnected) {
      this.socket.emit('send_message', { receiverId, message });
    }
  }

  markMessageAsRead(messageId) {
    if (this.isConnected) {
      this.socket.emit('message_read', { messageId });
    }
  }

  deleteMessage(messageId) {
    if (this.isConnected) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  // Typing indicators
  startTyping(receiverId) {
    if (this.isConnected) {
      this.socket.emit('typing_start', { receiverId });
    }
  }

  stopTyping(receiverId) {
    if (this.isConnected) {
      this.socket.emit('typing_stop', { receiverId });
    }
  }

  // Notification methods
  markNotificationAsRead(notificationId) {
    if (this.isConnected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  markAllNotificationsAsRead() {
    if (this.isConnected) {
      this.socket.emit('mark_all_notifications_read');
    }
  }

  deleteNotification(notificationId) {
    if (this.isConnected) {
      this.socket.emit('delete_notification', { notificationId });
    }
  }

  // Status methods
  setStatus(status) {
    if (this.isConnected) {
      this.socket.emit('set_status', { status });
    }
  }

  // Event handlers
  handleNewMessage(data) {
    console.log('New message received:', data);
    // Update your UI with the new message
    // data.message contains the message object
    // data.sender contains sender information
  }

  handleMessageRead(data) {
    console.log('Message read confirmation:', data);
    // Update message read status in your UI
    // data.messageId, data.readBy, data.readAt
  }

  handleMessageDeleted(data) {
    console.log('Message deleted:', data);
    // Remove message from your UI
    // data.messageId, data.deletedBy
  }

  handleNewNotification(data) {
    console.log('New notification:', data);
    // Show notification in your UI
    // data.type, data.fromUser, data.message, etc.
  }

  handleUserTyping(data) {
    console.log('User typing:', data);
    // Show typing indicator
    // data.userId, data.username
  }

  handleUserStoppedTyping(data) {
    console.log('User stopped typing:', data);
    // Hide typing indicator
    // data.userId
  }

  handleUserStatusChange(data) {
    console.log('User status changed:', data);
    // Update user status in your UI
    // data.userId, data.status
  }
}

// Usage example
const socketManager = new SocketManager();

// Connect when user logs in
function onUserLogin(token) {
  socketManager.connect(token);
}

// Disconnect when user logs out
function onUserLogout() {
  socketManager.disconnect();
}

// Send a message
function sendMessage(receiverId, message) {
  socketManager.sendMessage(receiverId, message);
}

// Mark message as read
function markMessageAsRead(messageId) {
  socketManager.markMessageAsRead(messageId);
}

export default socketManager;
```

## React Hook Example

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      auth: { token }
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Message events
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    socketRef.current.on('message_read_confirmation', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    });

    // Notification events
    socketRef.current.on('new_notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const sendMessage = (receiverId, message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', { receiverId, message });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message_read', { messageId });
    }
  };

  return {
    isConnected,
    messages,
    notifications,
    sendMessage,
    markMessageAsRead
  };
};
```

## Event Reference

### Client to Server Events

| Event | Data | Description |
|-------|------|-------------|
| `send_message` | `{ receiverId, message }` | Send a message to another user |
| `message_read` | `{ messageId }` | Mark a message as read |
| `delete_message` | `{ messageId }` | Delete a message |
| `typing_start` | `{ receiverId }` | Start typing indicator |
| `typing_stop` | `{ receiverId }` | Stop typing indicator |
| `mark_notification_read` | `{ notificationId }` | Mark notification as read |
| `delete_notification` | `{ notificationId }` | Delete a notification |
| `mark_all_notifications_read` | `{}` | Mark all notifications as read |
| `set_status` | `{ status }` | Update user status |

### Server to Client Events

| Event | Data | Description |
|-------|------|-------------|
| `receive_message` | `{ type, message, sender }` | New message received |
| `message_sent` | `{ status, message }` | Message sent confirmation |
| `message_read_confirmation` | `{ messageId, readBy, readAt }` | Message read confirmation |
| `message_deleted` | `{ messageId, deletedBy }` | Message deleted notification |
| `new_notification` | `{ type, fromUser, message, ... }` | New notification received |
| `user_typing` | `{ userId, username }` | User started typing |
| `user_stopped_typing` | `{ userId }` | User stopped typing |
| `user_status_change` | `{ userId, status }` | User status changed |
| `error` | `{ message }` | Error occurred |

## Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  if (error.message.includes('Authentication error')) {
    // Handle authentication errors
    handleAuthError();
  } else if (error.message.includes('Rate limit exceeded')) {
    // Handle rate limiting
    showRateLimitMessage();
  }
});
```

## Reconnection Strategy

```javascript
const socket = io('http://localhost:3000', {
  auth: { token },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});
``` 