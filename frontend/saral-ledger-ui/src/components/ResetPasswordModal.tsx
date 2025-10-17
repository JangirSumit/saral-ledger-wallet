import React, { useState } from 'react';
import { adminService } from '../services/api';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  username: string;
  onSuccess: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    setNewPassword(password.split('').sort(() => Math.random() - 0.5).join(''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminService.resetPassword(userId, newPassword);
      onSuccess();
      onClose();
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">🔑 Reset Password for {username}</h5>
            <button type="button" className="btn-close" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <div className="password-input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-pill"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={generatePassword} className="btn btn-outline-primary btn-sm rounded-pill">
                    🎲 Generate
                  </button>
                </div>
                <small className="text-muted">Must be 8+ chars with uppercase, lowercase, number & special character</small>
              </div>

              {error && (
                <div className="alert alert-danger rounded-pill">
                  {error}
                </div>
              )}
            </form>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-warning btn-lg rounded-pill px-5" 
              disabled={loading || !newPassword}
              onClick={handleSubmit}
            >
              {loading ? '⏳ Resetting...' : '🔑 Reset Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;