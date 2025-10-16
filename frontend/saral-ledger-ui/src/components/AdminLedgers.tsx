import { useState, useEffect } from 'react';
import { ledgerService } from '../services/api';
import type { Ledger, User } from '../types';
import RejectDialog from './RejectDialog';

interface AdminLedgersProps {
  user: User;
}

const AdminLedgers = ({ }: AdminLedgersProps) => {
  const [allLedgers, setAllLedgers] = useState<Ledger[]>([]);
  const [message, setMessage] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);

  useEffect(() => {
    loadAllLedgers();
  }, []);

  const loadAllLedgers = async () => {
    try {
      const data = await ledgerService.getAllLedgers();
      setAllLedgers(data);
    } catch (err) {
      console.error('Failed to load ledgers');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await ledgerService.approveLedger(id);
      setMessage('Ledger approved successfully!');
      loadAllLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = (id: number) => {
    setSelectedLedgerId(id);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedLedgerId) return;
    
    try {
      await ledgerService.rejectLedger(selectedLedgerId, reason);
      setMessage('Ledger rejected successfully!');
      loadAllLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Rejection failed');
    }
    
    setShowRejectDialog(false);
    setSelectedLedgerId(null);
  };

  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setSelectedLedgerId(null);
  };

  const handleDownload = async (ledger: Ledger) => {
    try {
      const blob = await ledgerService.downloadFile(ledger.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ledger.fileName || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setMessage('Failed to download file');
    }
  };

  const toggleCard = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-pill`}>
          {message}
        </div>
      )}

      <div className="table-glass">
        <div className="p-4 border-bottom">
          <h5 className="mb-0 fw-bold">📋 All Ledgers</h5>
        </div>
        <div className="p-0">
          {allLedgers.length === 0 ? (
            <div className="text-center p-5">
              <div className="fs-1 opacity-25 mb-3">📄</div>
              <h6 className="text-muted">No ledgers found</h6>
              <p className="text-muted small">No ledgers have been created yet!</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="fw-semibold py-2">User</th>
                      <th className="fw-semibold py-2">Amount</th>
                      <th className="fw-semibold py-2">Description</th>
                      <th className="fw-semibold py-2">Status</th>
                      <th className="fw-semibold py-2">Date</th>
                      <th className="fw-semibold py-2">File</th>
                      <th className="fw-semibold py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLedgers.map((ledger) => (
                      <tr key={ledger.id}>
                        <td className="py-2 fw-semibold">{ledger.user?.username}</td>
                        <td className="py-2">
                          <span className="fw-bold text-success fs-5">₹{ledger.amount.toFixed(2)}</span>
                        </td>
                        <td className="py-2">{ledger.description}</td>
                        <td className="py-2">
                          <span className={`badge rounded-pill px-2 py-1 ${
                            ledger.status === 'Approved' ? 'bg-success' : 
                            ledger.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {ledger.status === 'Approved' ? '✅' : ledger.status === 'Rejected' ? '❌' : '⏳'} {ledger.status}
                          </span>
                        </td>
                        <td className="py-2 text-muted">{new Date(ledger.createdAt).toLocaleDateString()}</td>
                        <td className="py-2">
                          {ledger.fileName ? (
                            <button
                              className="btn btn-outline-info btn-sm rounded-pill px-3"
                              onClick={() => handleDownload(ledger)}
                            >
                              📎 Download
                            </button>
                          ) : (
                            <span className="text-muted small">No file</span>
                          )}
                        </td>
                        <td className="py-2">
                          {ledger.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm rounded-pill me-2 px-3"
                                onClick={() => handleApprove(ledger.id)}
                              >
                                ✅ Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm rounded-pill px-3"
                                onClick={() => handleReject(ledger.id)}
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {allLedgers.map((ledger) => (
                  <div key={ledger.id} className="ledger-card">
                    <div className="ledger-card-header" onClick={() => toggleCard(ledger.id)}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold text-success fs-5">₹{ledger.amount.toFixed(2)}</span>
                          <span className={`badge rounded-pill ms-2 px-2 py-1 ${
                            ledger.status === 'Approved' ? 'bg-success' : 
                            ledger.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {ledger.status === 'Approved' ? '✅' : ledger.status === 'Rejected' ? '❌' : '⏳'}
                          </span>
                        </div>
                        <span className="expand-icon">
                          {expandedCard === ledger.id ? '▲' : '▼'}
                        </span>
                      </div>
                      <div className="text-muted small mt-1">
                        {ledger.user?.username} • {new Date(ledger.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {expandedCard === ledger.id && (
                      <div className="ledger-card-body">
                        <div className="mb-2">
                          <strong>Description:</strong>
                          <div className="text-muted small">{ledger.description}</div>
                        </div>
                        
                        <div className="d-flex gap-2 flex-wrap">
                          {ledger.fileName && (
                            <button
                              className="btn btn-outline-info btn-sm rounded-pill"
                              onClick={() => handleDownload(ledger)}
                            >
                              📎 Download
                            </button>
                          )}
                          
                          {ledger.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm rounded-pill"
                                onClick={() => handleApprove(ledger.id)}
                              >
                                ✅ Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm rounded-pill"
                                onClick={() => handleReject(ledger.id)}
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      <RejectDialog
        isOpen={showRejectDialog}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />
    </>
  );
};

export default AdminLedgers;