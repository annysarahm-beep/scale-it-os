import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { storageService } from '../../services/storage/storageService';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize demo data on component mount
  if (!storageService.getData('scaleit_organizations')) {
    storageService.initializeDemoData();
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = authService.login(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Scale IT OS</h1>
          <p>Enterprise Management System</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-section">
          <h3>Demo Accounts</h3>
          <button
            className="demo-btn"
            onClick={() => handleDemoLogin('admin@scaleitos.com', 'admin123')}
          >
            Admin (Owner)
          </button>
          <button
            className="demo-btn"
            onClick={() => handleDemoLogin('sales@scaleitos.com', 'sales123')}
          >
            Sales Agent
          </button>
          <button
            className="demo-btn"
            onClick={() => handleDemoLogin('finance@scaleitos.com', 'finance123')}
          >
            Finance Manager
          </button>
          <button
            className="demo-btn"
            onClick={() => handleDemoLogin('employee@scaleitos.com', 'employee123')}
          >
            Employee
          </button>
        </div>

        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
          <p><a href="/forgot-password">Forgot password?</a></p>
        </div>
      </div>
    </div>
  );
}
