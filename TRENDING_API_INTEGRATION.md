# Trending API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Trending API endpoints for managing trending topics and hashtags.

## 🚀 Base URL
```
http://localhost:3000/api/trending
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

### 1. **Create Trending Topic**
- **Endpoint**: `POST /api/trending`
- **Description**: Create a new trending topic (admin/moderator only)
- **Authentication**: Required (admin/moderator role)
- **Body**:
  ```json
  {
    "title": "Trending Topic Title",
    "hashtag": "#trending",
    "description": "Description of the trending topic",
    "category": "technology"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Trending topic created successfully",
    "trendingTopic": {
      "_id": "trending_topic_id",
      "title": "Trending Topic Title",
      "hashtag": "#trending",
      "description": "Description of the trending topic",
      "category": "technology",
      "createdBy": {
        "_id": "admin_user_id",
        "username": "admin_username"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. **Get All Trending Topics**
- **Endpoint**: `GET /api/trending`
- **Description**: Get all active trending topics
- **Authentication**: Not required
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Topics per page (default: 10)
  - `category` (optional): Filter by category
- **Response**:
  ```json
  {
    "status": "success",
    "trendingTopics": [
      {
        "_id": "trending_topic_id",
        "title": "Trending Topic Title",
        "hashtag": "#trending",
        "description": "Description of the trending topic",
        "category": "technology",
        "createdBy": {
          "_id": "admin_user_id",
          "username": "admin_username"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isDeleted": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalTopics": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 3. **Get Trending Topic by ID**
- **Endpoint**: `GET /api/trending/:topicId`
- **Description**: Get a specific trending topic by ID
- **Path Parameters**: `topicId` - ID of the trending topic
- **Authentication**: Not required
- **Response**:
  ```json
  {
    "status": "success",
    "trendingTopic": {
      "_id": "trending_topic_id",
      "title": "Trending Topic Title",
      "hashtag": "#trending",
      "description": "Description of the trending topic",
      "category": "technology",
      "createdBy": {
        "_id": "admin_user_id",
        "username": "admin_username"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isDeleted": false
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 4. **Update Trending Topic**
- **Endpoint**: `PATCH /api/trending/:topicId`
- **Description**: Update a trending topic (admin/moderator only)
- **Path Parameters**: `topicId` - ID of the trending topic
- **Authentication**: Required (admin/moderator role)
- **Body** (all fields optional):
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "category": "updated_category"
  }
  ```
- **Response**: Updated trending topic object

### 5. **Delete Trending Topic**
- **Endpoint**: `DELETE /api/trending/:topicId`
- **Description**: Soft delete a trending topic (admin/moderator only)
- **Path Parameters**: `topicId` - ID of the trending topic
- **Authentication**: Required (admin/moderator role)
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Trending topic deleted successfully"
  }
  ```

## 📊 Trending Topic Object Structure

```javascript
{
  "_id": "trending_topic_id",
  "title": "Trending Topic Title",
  "hashtag": "#trending",
  "description": "Description of the trending topic",
  "category": "technology", // technology, entertainment, sports, news, etc.
  "createdBy": {
    "_id": "admin_user_id",
    "username": "admin_username"
  },
  "isDeleted": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of topics per page (max 50)

### Filters
- `category`: Filter by topic category

### Categories
- `technology` - Tech-related topics
- `entertainment` - Entertainment and media
- `sports` - Sports and athletics
- `news` - Current events and news
- `lifestyle` - Lifestyle and culture
- `business` - Business and finance
- `science` - Science and research
- `politics` - Political topics

## 🚨 Error Handling

### Common Error Responses

#### 404 - Topic Not Found
```json
{
  "status": "failure",
  "error": "Trending topic not found"
}
```

#### 403 - Access Denied
```json
{
  "status": "failure",
  "error": "Access denied. Admin/moderator role required"
}
```

#### 400 - Validation Error
```json
{
  "status": "failure",
  "error": "Title is required"
}
```

#### 409 - Duplicate Hashtag
```json
{
  "status": "failure",
  "error": "Hashtag already exists"
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

### React Hook for Trending Topics
```javascript
import { useState, useEffect } from 'react';

const useTrendingTopics = (filters = {}) => {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchTrendingTopics = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      });

      const response = await fetch(`/api/trending?${queryParams}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTrendingTopics(data.trendingTopics);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, [filters]);

  return { trendingTopics, loading, pagination, fetchTrendingTopics };
};
```

### Trending Topics List Component
```javascript
const TrendingTopicsList = () => {
  const { trendingTopics, loading, pagination, fetchTrendingTopics } = useTrendingTopics();

  if (loading) return <div>Loading trending topics...</div>;

  return (
    <div className="trending-topics-container">
      <h2>Trending Topics</h2>
      
      {trendingTopics.length === 0 ? (
        <div className="no-trending-topics">
          <p>No trending topics available at the moment.</p>
        </div>
      ) : (
        <div className="trending-topics-grid">
          {trendingTopics.map(topic => (
            <div key={topic._id} className="trending-topic-card">
              <div className="topic-header">
                <span className="hashtag">{topic.hashtag}</span>
                <span className="category">{topic.category}</span>
              </div>
              
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
              
              <div className="topic-footer">
                <span className="created-by">By: {topic.createdBy.username}</span>
                <span className="created-date">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <button className="explore-topic-btn">
                Explore {topic.hashtag}
              </button>
            </div>
          ))}
        </div>
      )}

      {pagination.hasNext && (
        <button 
          onClick={() => fetchTrendingTopics(pagination.currentPage + 1)}
          className="load-more-btn"
        >
          Load More
        </button>
      )}
    </div>
  );
};
```

### Admin Trending Topic Management
```javascript
const AdminTrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [editingTopic, setEditingTopic] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const createTopic = async (topicData) => {
    try {
      const response = await fetch('/api/trending', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(topicData)
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTopics(prev => [data.trendingTopic, ...prev]);
        setShowForm(false);
        showSuccessMessage('Trending topic created successfully');
      }
    } catch (error) {
      console.error('Error creating trending topic:', error);
    }
  };

  const updateTopic = async (topicId, updates) => {
    try {
      const response = await fetch(`/api/trending/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTopics(prev => prev.map(topic => 
          topic._id === topicId ? { ...topic, ...updates } : topic
        ));
        setEditingTopic(null);
        showSuccessMessage('Trending topic updated successfully');
      }
    } catch (error) {
      console.error('Error updating trending topic:', error);
    }
  };

  const deleteTopic = async (topicId) => {
    if (!confirm('Are you sure you want to delete this trending topic?')) return;

    try {
      const response = await fetch(`/api/trending/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTopics(prev => prev.filter(topic => topic._id !== topicId));
        showSuccessMessage('Trending topic deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting trending topic:', error);
    }
  };

  return (
    <div className="admin-trending-topics">
      <div className="admin-header">
        <h2>Manage Trending Topics</h2>
        <button onClick={() => setShowForm(true)} className="create-topic-btn">
          Create New Topic
        </button>
      </div>

      {showForm && (
        <TrendingTopicForm 
          onSubmit={createTopic}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="topics-list">
        {topics.map(topic => (
          <div key={topic._id} className="topic-item">
            {editingTopic === topic._id ? (
              <TrendingTopicEditForm
                topic={topic}
                onSubmit={(updates) => updateTopic(topic._id, updates)}
                onCancel={() => setEditingTopic(null)}
              />
            ) : (
              <div className="topic-content">
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <span className="hashtag">{topic.hashtag}</span>
                <span className="category">{topic.category}</span>
                
                <div className="topic-actions">
                  <button onClick={() => setEditingTopic(topic._id)}>
                    Edit
                  </button>
                  <button onClick={() => deleteTopic(topic._id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Trending Topic Form Component
```javascript
const TrendingTopicForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    hashtag: initialData.hashtag || '',
    description: initialData.description || '',
    category: initialData.category || 'technology'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="trending-topic-form">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="Enter trending topic title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="hashtag">Hashtag *</label>
        <input
          type="text"
          id="hashtag"
          value={formData.hashtag}
          onChange={(e) => setFormData(prev => ({ ...prev, hashtag: e.target.value }))}
          required
          placeholder="#trending"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
          placeholder="Describe the trending topic"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="technology">Technology</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
          <option value="news">News</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="business">Business</option>
          <option value="science">Science</option>
          <option value="politics">Politics</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {initialData._id ? 'Update Topic' : 'Create Topic'}
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};
```

## 🔄 Real-Time Updates via Socket.IO

### Trending Topic Events
```javascript
// Listen for new trending topics
socket.on('trending_topic_created', (data) => {
  const { trendingTopic } = data;
  
  // Add to trending topics list
  setTrendingTopics(prev => [trendingTopic, ...prev]);
  
  // Show notification
  showNotification(`New trending topic: ${trendingTopic.title}`);
});

// Listen for trending topic updates
socket.on('trending_topic_updated', (data) => {
  const { topicId, updates } = data;
  
  // Update topic in local state
  setTrendingTopics(prev => prev.map(topic => 
    topic._id === topicId ? { ...topic, ...updates } : topic
  ));
});

// Listen for trending topic deletions
socket.on('trending_topic_deleted', (data) => {
  const { topicId } = data;
  
  // Remove topic from local state
  setTrendingTopics(prev => prev.filter(topic => topic._id !== topicId));
});
```

## 📱 Mobile Considerations

### Trending Topics Display
- Use card-based layout for mobile
- Implement swipe gestures
- Show trending indicators
- Support offline viewing

### Performance
- Cache trending topics locally
- Implement lazy loading
- Use pull-to-refresh
- Optimize image loading

### User Experience
- Show trending badges
- Allow topic subscriptions
- Implement topic suggestions
- Support topic sharing

## 🧪 Testing

### Test Data
```javascript
const testTrendingTopic = {
  title: "Test Trending Topic",
  hashtag: "#test",
  description: "This is a test trending topic for development",
  category: "technology"
};
```

### Test Scenarios
1. Create trending topics (admin)
2. Fetch trending topics list
3. Update trending topics (admin)
4. Delete trending topics (admin)
5. Test pagination and filters
6. Verify real-time updates
7. Test authorization checks

## 🔗 Related APIs

- **Posts**: `/api/posts` - Posts with trending hashtags
- **Search**: `/api/search/posts` - Search posts by trending topics
- **Users**: `/api/users` - User management
- **Categories**: `/api/categories` - Topic categories

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Admin Panel Setup](../ADMIN_PANEL.md) 