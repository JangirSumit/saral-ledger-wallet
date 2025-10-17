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
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData = requiresMfa ? { ...formData, mfaCode } : formData;
      const response = await authService.login(loginData);
      
      if (response.requiresMfa) {
        setRequiresMfa(true);
        setLoading(false);
        return;
      }
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.token, response.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-avatars">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-1" />
          <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-2" />
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-3" />
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-4" />
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-5" />
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" alt="" className="avatar avatar-6" />
        </div>
        <div className="workflow-illustration">
          <div className="workflow-step">📄</div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">✅</div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">💰</div>
        </div>
        <div className="login-card">
          <div className="login-header">
            <div className="brand-logo">
              <img src="/icon_192.png" alt="SaralPay" className="logo-icon" style={{width: '64px', height: '64px'}} />
              <h1 className="brand-title">SaralPay</h1>
            </div>
            <p className="login-subtitle">Upload ledgers, earn wallet money - Simple & Fast!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {!requiresMfa ? (
              <>
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
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">Two-Factor Authentication Code</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="text"
                    className="form-input text-center"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <small className="text-muted">Enter the 6-digit code from your authenticator app</small>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="login-button"
              disabled={loading || (requiresMfa && mfaCode.length !== 6)}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  {requiresMfa ? 'Verifying...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <span>{requiresMfa ? '📱' : '🔐'}</span>
                  {requiresMfa ? 'Verify Code' : 'Sign In'}
                </>
              )}
            </button>
            
            {requiresMfa && (
              <button
                type="button"
                className="btn btn-outline-secondary w-100 rounded-pill mt-2"
                onClick={() => {
                  setRequiresMfa(false);
                  setMfaCode('');
                  setError('');
                }}
              >
                ← Back to Login
              </button>
            )}
          </form>
          
          <div className="security-notice">
            <div className="security-text">
              🔒 Your data is protected with enterprise-grade security
            </div>
            <div className="security-features">
              <span className="security-item">🛡️ End-to-end encryption</span>
              <span className="security-item">🔐 Secure authentication</span>
              <span className="security-item">📊 Audit trails</span>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <button 
              type="button" 
              className="btn btn-link text-decoration-none p-0"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>
          </div>
          
          {showForgotPassword && (
            <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
              <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">🔑 Forgot Password?</h5>
                    <button type="button" className="btn-close" onClick={() => setShowForgotPassword(false)}>✕</button>
                  </div>
                  <div className="modal-body text-center">
                    <div className="mb-3">
                      <div className="text-muted mb-2">Need help accessing your account?</div>
                      <div className="fw-semibold">Contact your administrator for password reset assistance</div>
                    </div>
                    <div className="alert alert-info rounded-pill">
                      📞 Your admin can reset your password from the Users management panel
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary rounded-pill px-4" onClick={() => setShowForgotPassword(false)}>
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;