import { useState, useEffect } from 'react';
import { ledgerService, userService } from '../services/api';
import type { Ledger, User, LedgerUploadRequest } from '../types';
import Navbar from './Navbar';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard = ({ user: initialUser, onLogout }: UserDashboardProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState<LedgerUploadRequest>({
    amount: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ledgers');

  useEffect(() => {
    loadLedgers();
    loadProfile();
  }, []);

  const loadLedgers = async () => {
    try {
      const data = await ledgerService.getMyLedgers();
      setLedgers(data);
    } catch (err) {
      console.error('Failed to load ledgers');
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await ledgerService.uploadLedger(uploadData);
      setMessage('Ledger uploaded successfully! Waiting for admin approval.');
      setUploadData({ amount: 0, description: '' });
      setShowUploadForm(false);
      loadLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="content-area">
        <div className="container-fluid px-3 py-3">
          {user.role === 'User' && (
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <div className="stats-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-muted mb-1">💰 Wallet Balance</h6>
                      <h2 className="text-success mb-0 fw-bold">${user.walletAmount.toFixed(2)}</h2>
                    </div>
                    <div className="fs-1 opacity-25">💳</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="stats-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-muted mb-1">📊 Total Ledgers</h6>
                      <h2 className="text-primary mb-0 fw-bold">{ledgers.length}</h2>
                    </div>
                    <div className="fs-1 opacity-25">📋</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'User' && (
            <div className="mb-4">
              <button
                className={`btn ${showUploadForm ? 'btn-secondary' : 'btn-glass'} rounded-pill px-4 py-2`}
                onClick={() => setShowUploadForm(!showUploadForm)}
              >
                {showUploadForm ? '❌ Cancel' : '➕ Upload New Ledger'}
              </button>
            </div>
          )}

          {user.role === 'User' && showUploadForm && (
            <div className="glass-card p-4 mb-4">
              <h5 className="mb-4">📝 Upload New Ledger</h5>
              <form onSubmit={handleUpload}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Amount ($)</label>
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
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control form-control-lg rounded-3"
                      rows={3}
                      value={uploadData.description}
                      onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={loading}>
                  {loading ? '⏳ Uploading...' : '🚀 Upload Ledger'}
                </button>
              </form>
            </div>
          )}

          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-pill`}>
              {message}
            </div>
          )}

          <div className="table-glass">
            <div className="p-4 border-bottom">
              <h5 className="mb-0 fw-bold">📋 My Ledgers</h5>
            </div>
            <div className="p-0">
              {ledgers.length === 0 ? (
                <div className="text-center p-5">
                  <div className="fs-1 opacity-25 mb-3">📄</div>
                  <h6 className="text-muted">No ledgers found</h6>
                  <p className="text-muted small">Upload your first ledger to get started!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="fw-semibold py-3">Amount</th>
                        <th className="fw-semibold py-3">Description</th>
                        <th className="fw-semibold py-3">Status</th>
                        <th className="fw-semibold py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgers.map((ledger) => (
                        <tr key={ledger.id}>
                          <td className="py-3">
                            <span className="fw-bold text-success fs-5">${ledger.amount.toFixed(2)}</span>
                          </td>
                          <td className="py-3">{ledger.description}</td>
                          <td className="py-3">
                            <span className={`badge rounded-pill px-3 py-2 ${
                              ledger.status === 'Approved' ? 'bg-success' : 
                              ledger.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                            }`}>
                              {ledger.status === 'Approved' ? '✅' : ledger.status === 'Rejected' ? '❌' : '⏳'} {ledger.status}
                            </span>
                          </td>
                          <td className="py-3 text-muted">{new Date(ledger.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;