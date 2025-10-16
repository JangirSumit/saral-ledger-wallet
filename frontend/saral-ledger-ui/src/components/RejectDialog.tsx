import { useState } from 'react';

interface RejectDialogProps {
  isOpen: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const RejectDialog = ({ isOpen, onConfirm, onCancel }: RejectDialogProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">❌ Reject Ledger</h5>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-3">Please provide a reason for rejecting this ledger:</p>
            <textarea
              className="form-control rounded-3"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason..."
              autoFocus
            />
          </div>
          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger rounded-pill px-4"
              onClick={handleConfirm}
              disabled={!reason.trim()}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectDialog;