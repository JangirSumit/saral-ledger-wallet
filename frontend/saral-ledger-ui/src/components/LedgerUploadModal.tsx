import { useState, useEffect } from 'react';
import type { LedgerUploadRequest, Ledger } from '../types';

interface LedgerUploadModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: LedgerUploadRequest) => Promise<void>;
  loading: boolean;
  editData?: Ledger | null;
}

const LedgerUploadModal = ({ show, onClose, onSubmit, loading, editData }: LedgerUploadModalProps) => {
  const [uploadData, setUploadData] = useState<LedgerUploadRequest>({
    amount: 0,
    description: '',
    file: undefined,
  });

  useEffect(() => {
    if (editData) {
      setUploadData({
        amount: editData.amount,
        description: editData.description,
        file: undefined,
      });
    } else {
      setUploadData({ amount: 0, description: '', file: undefined });
    }
  }, [editData, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(uploadData);
    setUploadData({ amount: 0, description: '', file: undefined });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editData ? '✏️ Edit Ledger' : '📝 Upload New Ledger'}</h5>
            <button type="button" className="btn-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-lg rounded-pill"
                    value={uploadData.amount}
                    onChange={(e) => setUploadData({ ...uploadData, amount: parseFloat(e.target.value) })}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Description *</label>
                  <textarea
                    className="form-control form-control-lg rounded-3"
                    rows={3}
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Enter transaction details (bank name, account number, transaction ID, etc.)"
                    required
                  />
                  <small className="text-muted mt-1 d-block">
                    📝 Please include: Bank name, Account details, Transaction ID, Purpose of transaction
                  </small>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">Evidence File *</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] })}
                      required={!editData}
                    />
                    <small className="text-muted mt-1 d-block">
                      📎 Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                      {editData && <><br/>📝 Leave empty to keep existing file</>}
                    </small>
                    {uploadData.file && (
                      <div className="selected-file mt-2">
                        <span className="badge bg-primary rounded-pill">
                          📄 {uploadData.file.name}
                        </span>
                      </div>
                    )}
                    {editData?.fileName && !uploadData.file && (
                      <div className="existing-file mt-2">
                        <span className="badge bg-success rounded-pill">
                          📄 {editData.fileName} (Current file)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={loading}>
                  {loading ? '⏳ Processing...' : editData ? '💾 Update Ledger' : '🚀 Upload Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerUploadModal;