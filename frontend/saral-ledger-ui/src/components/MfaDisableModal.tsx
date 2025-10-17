import { useState } from 'react';
import { userService } from '../services/api';

interface MfaDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MfaDisableModal = ({ isOpen, onClose, onSuccess }: MfaDisableModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDisable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await userService.disableMfa(verificationCode);
      setMessage('MFA disabled successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">🔓 Disable Two-Factor Authentication</h5>
            <button type="button" className="btn-close" onClick={handleClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <div className="fs-1 mb-3">⚠️</div>
              <h6>Disable MFA</h6>
              <p className="text-muted small">
                This will remove the extra security layer from your account. 
                Enter your current authenticator code to confirm.
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Verification Code</label>
              <input
                type="text"
                className="form-control rounded-3 text-center"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            {message && (
              <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-3 mb-3`}>
                {message}
              </div>
            )}

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill flex-fill"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger rounded-pill flex-fill"
                onClick={handleDisable}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? '⏳ Disabling...' : '🔓 Disable MFA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaDisableModal;