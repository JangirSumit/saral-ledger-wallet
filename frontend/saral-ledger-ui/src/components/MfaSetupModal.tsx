import { useState } from 'react';
import { userService } from '../services/api';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MfaSetupModal = ({ isOpen, onClose, onSuccess }: MfaSetupModalProps) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await userService.setupMfa();
      setSecret(response.secret);
      setQrCodeUrl(response.qrCodeUrl);
      setStep('verify');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await userService.enableMfa(verificationCode);
      setMessage('MFA enabled successfully!');
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
    setStep('setup');
    setSecret('');
    setQrCodeUrl('');
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
            <h5 className="modal-title fw-bold">🔐 Setup Two-Factor Authentication</h5>
            <button type="button" className="btn-close" onClick={handleClose}>✕</button>
          </div>
          <div className="modal-body">
            {step === 'setup' && (
              <div className="text-center">
                <div className="mb-4">
                  <div className="fs-1 mb-3">📱</div>
                  <h6>Secure Your Account</h6>
                  <p className="text-muted small">
                    Two-factor authentication adds an extra layer of security to your account.
                    You'll need an authenticator app like Google Authenticator or Authy.
                  </p>
                </div>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleSetup}
                  disabled={loading}
                >
                  {loading ? '⏳ Setting up...' : '🚀 Setup MFA'}
                </button>
              </div>
            )}

            {step === 'verify' && (
              <div>
                <div className="text-center mb-4">
                  <h6>Scan QR Code</h6>
                  <p className="text-muted small">
                    Scan this QR code with your authenticator app, then enter the 6-digit code below.
                  </p>
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                      alt="MFA QR Code"
                      className="img-fluid"
                    />
                  </div>
                  <div className="text-muted small">
                    <strong>Manual Entry:</strong><br />
                    <code className="bg-light px-2 py-1 rounded">{secret}</code>
                  </div>
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

                <button
                  className="btn btn-success w-100 rounded-pill"
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? '⏳ Verifying...' : '✅ Enable MFA'}
                </button>
              </div>
            )}

            {message && (
              <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-3 mt-3`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaSetupModal;