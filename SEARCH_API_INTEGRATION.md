# Search API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Search API endpoints for finding users and posts.

## 🚀 Base URL
```
http://localhost:3000/api/search
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

### 1. **Search Users**
- **Endpoint**: `GET /api/search/users`
- **Description**: Search for users by username or email
- **Query Parameters**:
  - `query` (required): Search term (min 2 characters)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Response**:
  ```json
  {
    "status": "success",
    "users": [
      {
        "_id": "user_id",
        "username": "username",
        "email": "user@example.com",
        "profileImage": "profile_image_url",
        "bio": "User bio",
        "isVerified": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 2. **Search Posts**
- **Endpoint**: `GET /api/search/posts`
- **Description**: Search for posts by content or hashtags
- **Query Parameters**:
  - `query` (required): Search term (min 2 characters)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
  - `privacy` (optional): Filter by privacy (default: "public")
- **Response**:
  ```json
  {
    "status": "success",
    "posts": [
      {
        "_id": "post_id",
        "content": "Post content with search term",
        "user": {
          "_id": "user_id",
          "username": "username",
          "profileImage": "profile_image_url"
        },
        "tags": ["#search", "#term"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalPosts": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

## 📊 Search Result Structures

### User Search Result
```javascript
{
  "_id": "user_id",
  "username": "username",
  "email": "user@example.com",
  "profileImage": "profile_image_url",
  "bio": "User bio text",
  "isVerified": true
}
```

### Post Search Result
```javascript
{
  "_id": "post_id",
  "content": "Post content text",
  "user": {
    "_id": "user_id",
    "username": "username",
    "profileImage": "profile_image_url"
  },
  "tags": ["#tag1", "#tag2"],
  "media": ["media_url1", "media_url2"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters Reference

### Required Parameters
- `query`: Search term (minimum 2 characters)

### Optional Parameters
- `page`: Page number (starts from 1)
- `limit`: Number of results per page (max 50)
- `privacy`: Post privacy filter ("public", "friends", "private") - only for post search

### Search Behavior
- **Case Insensitive**: Searches are not case-sensitive
- **Partial Matching**: Finds partial matches in usernames, emails, and content
- **Hashtag Support**: Searches within hashtag arrays for posts
- **Active Users Only**: Only returns active, non-deleted users

## 🚨 Error Handling

### Common Error Responses

#### 400 - Query Too Short
```json
{
  "status": "failure",
  "error": "Search query must be at least 2 characters long"
}
```

#### 400 - Missing Query
```json
{
  "status": "failure",
  "error": "Search query is required"
}
```

#### 401 - Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

#### 404 - No Results
```json
{
  "status": "success",
  "users": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalUsers": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## 💡 Frontend Integration Examples

### React Hook for Search
```javascript
import { useState, useEffect, useCallback } from 'react';

const useSearch = (searchType = 'users') => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  const search = useCallback(async (searchQuery, page = 1) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setPagination({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        query: searchQuery.trim(),
        page: page.toString()
      });

      const response = await fetch(`/api/search/${searchType}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResults(data[searchType] || []);
        setPagination(data.pagination || {});
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchType]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        search(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    pagination,
    error,
    search
  };
};
```

### Search Component Example
```javascript
const SearchComponent = ({ type = 'users' }) => {
  const {
    query,
    setQuery,
    results,
    loading,
    pagination,
    error,
    search
  } = useSearch(type);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      search(query);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      search(query, pagination.currentPage + 1);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${type}...`}
          className="search-input"
          minLength={2}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Searching...</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Results ({pagination.totalUsers || pagination.totalPosts})</h3>
          
          {type === 'users' ? (
            <UserSearchResults users={results} />
          ) : (
            <PostSearchResults posts={results} />
          )}

          {pagination.hasNext && (
            <button onClick={handleLoadMore} className="load-more-btn">
              Load More
            </button>
          )}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="no-results">
          No {type} found for "{query}"
        </div>
      )}
    </div>
  );
};
```

### User Search Results Component
```javascript
const UserSearchResults = ({ users }) => {
  return (
    <div className="user-results">
      {users.map(user => (
        <div key={user._id} className="user-result-item">
          <img 
            src={user.profileImage || '/default-avatar.png'} 
            alt={user.username}
            className="user-avatar"
          />
          <div className="user-info">
            <h4 className="username">
              {user.username}
              {user.isVerified && <span className="verified-badge">✓</span>}
            </h4>
            <p className="user-bio">{user.bio}</p>
          </div>
          <button className="follow-btn">Follow</button>
        </div>
      ))}
    </div>
  );
};
```

### Post Search Results Component
```javascript
const PostSearchResults = ({ posts }) => {
  return (
    <div className="post-results">
      {posts.map(post => (
        <div key={post._id} className="post-result-item">
          <div className="post-header">
            <img 
              src={post.user.profileImage || '/default-avatar.png'} 
              alt={post.user.username}
              className="user-avatar"
            />
            <span className="username">{post.user.username}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="post-content">
            <p>{post.content}</p>
            {post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Advanced Search with Filters
```javascript
const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    type: 'users',
    privacy: 'public',
    limit: 10
  });

  const { results, loading, pagination, search } = useSearch(searchParams.type);

  const handleAdvancedSearch = (e) => {
    e.preventDefault();
    if (searchParams.query.trim().length >= 2) {
      search(searchParams.query);
    }
  };

  return (
    <form onSubmit={handleAdvancedSearch} className="advanced-search-form">
      <div className="search-row">
        <input
          type="text"
          value={searchParams.query}
          onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          placeholder="Enter search term..."
          minLength={2}
          required
        />
        
        <select
          value={searchParams.type}
          onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="users">Users</option>
          <option value="posts">Posts</option>
        </select>

        {searchParams.type === 'posts' && (
          <select
            value={searchParams.privacy}
            onChange={(e) => setSearchParams(prev => ({ ...prev, privacy: e.target.value }))}
          >
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Private</option>
          </select>
        )}

        <select
          value={searchParams.limit}
          onChange={(e) => setSearchParams(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};
```

## 🔄 Real-Time Search Updates

### Search Suggestions
```javascript
// Get search suggestions as user types
const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length >= 2) {
      // Debounced API call for suggestions
      const timeoutId = setTimeout(() => {
        fetchSearchSuggestions(query);
      }, 200);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSearchSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(`/api/search/users?query=${searchQuery}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setSuggestions(data.users);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  return suggestions;
};
```

## 📱 Mobile Considerations

### Search UX
- Implement search history
- Add voice search support
- Use pull-to-refresh for results
- Implement infinite scroll

### Performance
- Debounce search input
- Cache search results
- Implement search result pagination
- Use virtual scrolling for large result sets

### Accessibility
- Add search result announcements
- Support keyboard navigation
- Provide clear search feedback
- Include search result counts

## 🧪 Testing

### Test Data
```javascript
const testSearchQueries = [
  "john",
  "developer",
  "#javascript",
  "social media",
  "test user"
];
```

### Test Scenarios
1. Search with different query lengths
2. Test pagination
3. Verify search filters work
4. Test error handling
5. Check search result accuracy
6. Test mobile responsiveness

## 🔗 Related APIs

- **Users**: `/api/users/:userId` - User profiles
- **Posts**: `/api/posts/:postId` - Post details
- **Follow**: `/api/follow` - Follow users from search results
- **Messages**: `/api/messages` - Message users from search results

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [User Management](../USERS_API_INTEGRATION.md) 