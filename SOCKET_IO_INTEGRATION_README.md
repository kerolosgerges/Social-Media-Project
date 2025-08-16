# Socket.IO Real-Time Communication Integration

This document describes the complete Socket.IO integration for real-time communication in the Social Media API.

## 🚀 Features Implemented

### 1. **Real-Time Messaging**
- Instant message delivery via WebSocket
- Message read confirmations
- Message deletion notifications
- Typing indicators
- User status updates

### 2. **Real-Time Notifications**
- New reaction notifications
- New follow notifications
- New message notifications
- Instant notification delivery
- Notification management via socket

### 3. **Security & Scalability**
- JWT authentication for socket connections
- Rate limiting to prevent spam
- User-specific rooms for privacy
- Structured event handlers
- Error handling and validation

## 📁 Project Structure

```
Src/
├── Modules/
│   ├── Socket/
│   │   ├── socket.handler.js          # Main socket handler
│   │   └── handlers/
│   │       ├── message.handler.js     # Message events
│   │       └── notification.handler.js # Notification events
│   ├── Notification/                   # New notification module
│   │   ├── notification.controller.js
│   │   └── Services/
│   │       └── notification.service.js
│   ├── Message/                        # Updated with socket events
│   ├── Reaction/                       # Updated with notifications
│   └── Follow/                         # Updated with notifications
├── DB/Models/
│   ├── Notification.model.js           # New notification model
│   └── Updated existing models
└── app.controller.js                   # Updated with Socket.IO server
```

## 🔧 Server Setup

### Socket.IO Server Configuration

The Socket.IO server is integrated into the main Express application with:

- **CORS Support**: Configured for client connections
- **JWT Authentication**: Token verification before connection
- **User Rooms**: Each user joins their personal room for targeted events
- **Event Handlers**: Organized by functionality (messages, notifications)

### Authentication Flow

1. Client connects with JWT token in auth object
2. Server verifies token using existing auth service
3. User data attached to socket for authorization
4. User joins personal room for targeted events

## 📡 Socket Events

### Message Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `send_message` | Client → Server | `{ receiverId, message }` | Send message to user |
| `receive_message` | Server → Client | `{ type, message, sender }` | Receive new message |
| `message_read` | Client → Server | `{ messageId }` | Mark message as read |
| `message_read_confirmation` | Server → Client | `{ messageId, readBy, readAt }` | Confirm message read |
| `delete_message` | Client → Server | `{ messageId }` | Delete message |
| `message_deleted` | Server → Client | `{ messageId, deletedBy }` | Confirm message deletion |

### Notification Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `new_notification` | Server → Client | `{ type, fromUser, message, ... }` | New notification received |
| `mark_notification_read` | Client → Server | `{ notificationId }` | Mark notification as read |
| `notification_updated` | Server → Client | `{ notificationId, isRead, status }` | Confirm notification update |
| `delete_notification` | Client → Server | `{ notificationId }` | Delete notification |
| `notification_deleted` | Server → Client | `{ notificationId, status }` | Confirm notification deletion |

### Typing & Status Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `typing_start` | Client → Server | `{ receiverId }` | Start typing indicator |
| `user_typing` | Server → Client | `{ userId, username }` | User started typing |
| `typing_stop` | Client → Server | `{ receiverId }` | Stop typing indicator |
| `user_stopped_typing` | Server → Client | `{ userId }` | User stopped typing |
| `set_status` | Client → Server | `{ status }` | Update user status |
| `user_status_change` | Server → Client | `{ userId, status }` | User status changed |

## 🛡️ Security Features

### Rate Limiting

Each socket event has configurable rate limits:

- **Messages**: 10 per minute
- **Typing events**: 10 per 30 seconds
- **Status updates**: 3 per 5 minutes
- **Notification updates**: 20 per minute
- **Bulk operations**: 3 per 5 minutes

### Authentication & Authorization

- JWT token verification on connection
- User-specific event access
- Prevention of unauthorized operations
- Input validation for all events

## 📊 Notification System

### Notification Types

```javascript
const notificationTypes = [
  'new_reaction',      // User reacted to post
  'new_follow',        // User started following
  'follow_accepted',   // Follow request accepted
  'new_message',       // New message received
  'new_comment',       // New comment on post
  'post_liked',        // Post was liked
  'mention',           // User mentioned in post/comment
  'system'             // System notifications
];
```

### Notification Model

```javascript
{
  userId: ObjectId,        // Recipient
  type: String,            // Notification type
  fromUser: ObjectId,      // Sender (optional)
  postId: ObjectId,        // Related post (optional)
  message: String,         // Human-readable message
  isRead: Boolean,         // Read status
  metadata: Object,        // Additional data
  createdAt: Date          // Timestamp
}
```

## 🔄 API Integration

### REST + WebSocket Hybrid

The system maintains both REST APIs and WebSocket events:

- **REST APIs**: For initial data loading, CRUD operations
- **WebSocket Events**: For real-time updates and notifications
- **Automatic Sync**: REST operations trigger WebSocket events

### Service Updates

Existing services now emit real-time events:

- **Message Service**: Emits `receive_message` on send
- **Reaction Service**: Emits `new_notification` on reaction
- **Follow Service**: Emits `new_notification` on follow

## 📱 Client Integration

### Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket', 'polling']
});
```

### Event Handling

```javascript
// Listen for new messages
socket.on('receive_message', (data) => {
  console.log('New message:', data.message);
  // Update UI
});

// Listen for notifications
socket.on('new_notification', (data) => {
  console.log('New notification:', data.message);
  // Show notification
});
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Ensure your `.env` file includes:

```env
PORT=3000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

### 3. Start the Server

```bash
npm run dev
```

The server will start with both HTTP and WebSocket support.

### 4. Test Socket Connection

Use the provided client examples in `SOCKET_IO_CLIENT_EXAMPLE.md` to test the real-time functionality.

## 🔍 Testing

### Socket.IO Testing

1. **Connection Test**: Verify JWT authentication
2. **Message Test**: Send/receive real-time messages
3. **Notification Test**: Trigger notifications via API
4. **Rate Limiting**: Test event rate limits
5. **Error Handling**: Test invalid operations

### API Testing

1. **Notification Endpoints**: Test CRUD operations
2. **Integration**: Verify API triggers socket events
3. **Authentication**: Test protected endpoints

## 📈 Performance Considerations

### Scalability Features

- **User Rooms**: Efficient event targeting
- **Rate Limiting**: Prevents abuse
- **Event Validation**: Reduces unnecessary processing
- **Connection Management**: Proper cleanup on disconnect

### Monitoring

- Connection counts
- Event frequency
- Error rates
- Response times

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**: Check JWT token and server status
2. **Events Not Received**: Verify user room membership
3. **Rate Limiting**: Check event frequency
4. **Authentication Errors**: Verify token validity

### Debug Mode

Enable debug logging by setting environment variable:

```env
DEBUG=socket.io:*
```

## 🔮 Future Enhancements

### Planned Features

- **Group Chats**: Multi-user conversations
- **File Sharing**: Real-time file transfer
- **Presence System**: Online/offline status
- **Push Notifications**: Mobile integration
- **Analytics**: Event tracking and metrics

### Performance Improvements

- **Redis Adapter**: Multi-server support
- **Event Queuing**: High-load handling
- **Compression**: Reduce bandwidth usage
- **Caching**: Optimize frequent operations

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Client Examples](SOCKET_IO_CLIENT_EXAMPLE.md)
- [API Documentation](NEW_MODULES_API_DOCUMENTATION.md)
- [Socket Event Reference](SOCKET_IO_CLIENT_EXAMPLE.md#event-reference)

## 🤝 Contributing

When adding new socket events:

1. Follow the existing handler pattern
2. Add rate limiting
3. Include proper validation
4. Update documentation
5. Add tests

## 📄 License

This Socket.IO integration follows the same license as the main project. 