# Authentication API Integration Guide

This guide provides comprehensive information for frontend developers to integrate with the Authentication API endpoints for user registration, login, and account management.

## 🚀 Base URL
```
http://localhost:3000/api/auth
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

### 1. **User Registration**
- **Endpoint**: `POST /api/auth/register`
- **Description**: Create a new user account
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepassword123",
    "confirmPassword": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "user": {
      "_id": "user_id",
      "username": "newuser",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_string"
  }
  ```

### 2. **User Login**
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and get access token
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "profile_image_url",
      "isVerified": true,
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_string"
  }
  ```

### 3. **Forgot Password**
- **Endpoint**: `POST /api/auth/forgot-password`
- **Description**: Send password reset email
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Password reset email sent successfully"
  }
  ```

### 4. **Reset Password**
- **Endpoint**: `POST /api/auth/reset-password`
- **Description**: Reset password using reset token
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Password reset successfully"
  }
  ```

### 5. **Change Password**
- **Endpoint**: `PATCH /api/auth/change-password`
- **Description**: Change user's current password
- **Authentication**: Required
- **Body**:
  ```json
  {
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Password changed successfully"
  }
  ```

### 6. **Verify Email**
- **Endpoint**: `POST /api/auth/verify-email`
- **Description**: Verify user's email address
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "token": "verification_token_from_email"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Email verified successfully"
  }
  ```

### 7. **Resend Verification Email**
- **Endpoint**: `POST /api/auth/resend-verification`
- **Description**: Resend email verification
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Verification email sent successfully"
  }
  ```

### 8. **Logout**
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Logout user and invalidate token
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```

### 9. **Refresh Token**
- **Endpoint**: `POST /api/auth/refresh`
- **Description**: Get new access token using refresh token
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "refreshToken": "refresh_token_string"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Token refreshed successfully",
    "token": "new_jwt_token_string"
  }
  ```

### 10. **Get Current User**
- **Endpoint**: `GET /api/auth/me`
- **Description**: Get current authenticated user's profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "status": "success",
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "profile_image_url",
      "coverImage": "cover_image_url",
      "bio": "User bio",
      "isVerified": true,
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## 📊 User Object Structure

```javascript
{
  "_id": "user_id",
  "username": "username",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImage": "profile_image_url",
  "coverImage": "cover_image_url",
  "bio": "User bio text",
  "phone": "+1234567890",
  "address": "User address",
  "birthday": "1990-01-01T00:00:00.000Z",
  "gender": "male", // male, female, other
  "isVerified": true,
  "isActive": true,
  "isOnline": true,
  "lastSeen": "2024-01-01T00:00:00.000Z",
  "role": "user", // user, admin, moderator
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Validation Rules

### Registration Requirements
- `username`: 3-30 characters, alphanumeric + underscore
- `email`: Valid email format, unique
- `password`: 8+ characters, at least one uppercase, lowercase, number
- `confirmPassword`: Must match password
- `firstName`: 2-50 characters
- `lastName`: 2-50 characters
- `phone`: Valid phone format (optional)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🚨 Error Handling

### Common Error Responses

#### 400 - Validation Error
```json
{
  "status": "failure",
  "error": "Username must be at least 3 characters long"
}
```

#### 409 - User Already Exists
```json
{
  "status": "failure",
  "error": "Username or email already exists"
}
```

#### 401 - Invalid Credentials
```json
{
  "status": "failure",
  "error": "Invalid email or password"
}
```

#### 401 - Unauthorized
```json
{
  "status": "failure",
  "error": "Authentication required"
}
```

#### 400 - Invalid Token
```json
{
  "status": "failure",
  "error": "Invalid or expired token"
}
```

#### 404 - User Not Found
```json
{
  "status": "failure",
  "error": "User not found"
}
```

## 💡 Frontend Integration Examples

### React Hook for Authentication
```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  const getCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.user);
      } else {
        // Token might be expired
        logout();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Login Component
```javascript
const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect to dashboard or home
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
          placeholder="Enter your password"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="form-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Don't have an account? Sign up</Link>
      </div>
    </form>
  );
};
```

### Registration Component
```javascript
const RegistrationForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      // Redirect to dashboard or verification page
      navigate('/verify-email');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
            placeholder="First name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
          placeholder="Choose a username"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone (Optional)</label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Phone number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
          placeholder="Create a password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
          placeholder="Confirm your password"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="form-links">
        <Link to="/login">Already have an account? Sign in</Link>
      </div>
    </form>
  );
};
```

### Password Reset Component
```javascript
const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage('Password reset email sent successfully. Please check your inbox.');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <h2>Reset Password</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Sending...' : 'Send Reset Email'}
      </button>

      <div className="form-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </form>
  );
};
```

## 🔄 Token Management

### Automatic Token Refresh
```javascript
const useTokenRefresh = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    const refreshToken = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken: token })
        });

        const data = await response.json();
        if (data.status === 'success') {
          // Update token in context
          localStorage.setItem('token', data.token);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    // Refresh token every 14 minutes (assuming 15-minute expiry)
    const interval = setInterval(refreshToken, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, logout]);
};
```

### Protected Route Component
```javascript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Usage in router
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 📱 Mobile Considerations

### Form UX
- Use appropriate input types
- Implement form validation
- Show password strength indicators
- Support biometric authentication

### Security
- Implement rate limiting
- Use secure storage for tokens
- Handle offline scenarios
- Support app lock

### User Experience
- Remember login state
- Auto-fill forms
- Show loading states
- Handle errors gracefully

## 🧪 Testing

### Test Data
```javascript
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "TestPass123!",
  firstName: "Test",
  lastName: "User"
};
```

### Test Scenarios
1. User registration
2. User login/logout
3. Password reset flow
4. Email verification
5. Token refresh
6. Protected routes
7. Error handling
8. Form validation

## 🔗 Related APIs

- **Users**: `/api/users` - User profile management
- **Posts**: `/api/posts` - User posts after authentication
- **Messages**: `/api/messages` - Direct messaging
- **Notifications**: `/api/notifications` - User notifications

## 📚 Additional Resources

- [Socket.IO Integration](../SOCKET_IO_INTEGRATION_README.md)
- [API Documentation](../README.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Security Best Practices](../SECURITY.md) 