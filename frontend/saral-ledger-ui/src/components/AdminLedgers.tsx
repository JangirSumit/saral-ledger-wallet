import { useState, useEffect } from 'react';
import { ledgerService } from '../services/api';
import type { Ledger, User } from '../types';

interface AdminLedgersProps {
  user: User;
}

const AdminLedgers = ({ }: AdminLedgersProps) => {
  const [pendingLedgers, setPendingLedgers] = useState<Ledger[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPendingLedgers();
  }, []);

  const loadPendingLedgers = async () => {
    try {
      const data = await ledgerService.getPendingLedgers();
      setPendingLedgers(data);
    } catch (err) {
      console.error('Failed to load pending ledgers');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await ledgerService.approveLedger(id);
      setMessage('Ledger approved successfully!');
      loadPendingLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await ledgerService.rejectLedger(id);
      setMessage('Ledger rejected successfully!');
      loadPendingLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Rejection failed');
    }
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
          <h5 className="mb-0 fw-bold">⏳ Pending Ledgers</h5>
        </div>
        <div className="p-0">
          {pendingLedgers.length === 0 ? (
            <div className="text-center p-5">
              <div className="fs-1 opacity-25 mb-3">📄</div>
              <h6 className="text-muted">No pending ledgers</h6>
              <p className="text-muted small">All ledgers have been processed!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="fw-semibold py-2">User</th>
                    <th className="fw-semibold py-2">Amount</th>
                    <th className="fw-semibold py-2">Description</th>
                    <th className="fw-semibold py-2">Created</th>
                    <th className="fw-semibold py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLedgers.map((ledger) => (
                    <tr key={ledger.id}>
                      <td className="py-2 fw-semibold">{ledger.user?.username}</td>
                      <td className="py-2">
                        <span className="fw-bold text-success fs-5">₹{ledger.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-2">{ledger.description}</td>
                      <td className="py-2 text-muted">{new Date(ledger.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLedgers;