import React, { useState, useEffect } from 'react';
import './UserAuth.css';

const UserAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    hardware_background: '',
    software_background: ''
  });

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token and get user info
      fetchUserInfo(token);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('/api/auth/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('auth_token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginForm.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        fetchUserInfo(data.access_token);
        setShowLogin(false);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerForm)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        fetchUserInfo(data.access_token);
        setShowRegister(false);
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.detail || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/auth/profile/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hardware_background: user.hardware_background,
          software_background: user.software_background
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile.');
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="user-auth-container">
        <div className="user-greeting">
          <h3>Welcome, {user.email}!</h3>
          <button onClick={() => setShowProfile(!showProfile)} className="btn btn-secondary">
            {showProfile ? 'Hide Profile' : 'View Profile'}
          </button>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>

        {showProfile && (
          <div className="profile-section">
            <h4>Profile Information</h4>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Hardware Background:</label>
                <textarea
                  value={user.hardware_background || ''}
                  onChange={(e) => setUser({...user, hardware_background: e.target.value})}
                  placeholder="Describe your hardware experience (e.g., robotics, electronics, etc.)"
                />
              </div>
              <div className="form-group">
                <label>Software Background:</label>
                <textarea
                  value={user.software_background || ''}
                  onChange={(e) => setUser({...user, software_background: e.target.value})}
                  placeholder="Describe your software experience (e.g., programming languages, frameworks, etc.)"
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="user-auth-container">
      <div className="auth-options">
        <button
          onClick={() => {
            setShowLogin(true);
            setShowRegister(false);
          }}
          className="btn btn-primary"
        >
          Login
        </button>
        <button
          onClick={() => {
            setShowRegister(true);
            setShowLogin(false);
          }}
          className="btn btn-secondary"
        >
          Register
        </button>
      </div>

      {showLogin && (
        <div className="auth-form login-form">
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {showRegister && (
        <div className="auth-form register-form">
          <h3>Register</h3>
          <p>Please provide your background information to personalize your learning experience:</p>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Hardware Background:</label>
              <textarea
                value={registerForm.hardware_background}
                onChange={(e) => setRegisterForm({...registerForm, hardware_background: e.target.value})}
                placeholder="Describe your hardware experience (e.g., robotics, electronics, etc.)"
              />
            </div>
            <div className="form-group">
              <label>Software Background:</label>
              <textarea
                value={registerForm.software_background}
                onChange={(e) => setRegisterForm({...registerForm, software_background: e.target.value})}
                placeholder="Describe your software experience (e.g., programming languages, frameworks, etc.)"
              />
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserAuth;