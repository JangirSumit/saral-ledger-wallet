import { useState } from 'react';
import { userService } from '../services/api';
import type { ChangePasswordRequest } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (formData.newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setMessage(`Password must have: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(formData);
      setMessage('Password changed successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '' });
    setConfirmPassword('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  const passwordErrors = validatePassword(formData.newPassword);
  const isPasswordValid = passwordErrors.length === 0 && formData.newPassword.length > 0;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">🔐 Change Password</h5>
            <button type="button" className="btn-close" onClick={handleClose}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control rounded-3"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control rounded-3"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                {formData.newPassword && (
                  <div className="mt-2">
                    {passwordErrors.map((error, index) => (
                      <div key={index} className="text-danger small">❌ {error}</div>
                    ))}
                    {isPasswordValid && <div className="text-success small">✅ Strong password</div>}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control rounded-3"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && (
                  <div className="mt-1">
                    {formData.newPassword === confirmPassword ? (
                      <div className="text-success small">✅ Passwords match</div>
                    ) : (
                      <div className="text-danger small">❌ Passwords do not match</div>
                    )}
                  </div>
                )}
              </div>

              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-3`}>
                  {message}
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4"
                disabled={loading || !isPasswordValid || formData.newPassword !== confirmPassword}
              >
                {loading ? '⏳ Changing...' : '🔐 Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;