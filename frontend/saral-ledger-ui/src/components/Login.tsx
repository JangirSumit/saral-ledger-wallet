import { useState } from 'react';
import { authService } from '../services/api';
import type { LoginRequest } from '../types';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.token);
      onLogin(response.token, response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-logo">
              <img src="/icon_192.png" alt="SaralPay" className="logo-icon" style={{width: '64px', height: '64px'}} />
              <h1 className="brand-title">SaralPay</h1>
            </div>
            <p className="login-subtitle">Upload ledgers, earn wallet money - Simple & Fast!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span>🔐</span>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="demo-accounts">
            <div className="demo-header">
              <span className="demo-icon">🎯</span>
              Demo Accounts
            </div>
            <div className="demo-grid">
              <div className="demo-account">
                <div className="demo-role admin">
                  <span className="role-icon">👑</span>
                  Admin
                </div>
                <div className="demo-credentials">admin / admin123</div>
              </div>
              <div className="demo-account">
                <div className="demo-role user">
                  <span className="role-icon">👤</span>
                  User
                </div>
                <div className="demo-credentials">user1 / user123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;