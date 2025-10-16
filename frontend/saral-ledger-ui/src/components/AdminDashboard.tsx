import { useState, useEffect } from 'react';
import { ledgerService, userService } from '../services/api';
import type { Ledger, User, CreateUserRequest } from '../types';
import Navbar from './Navbar';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [pendingLedgers, setPendingLedgers] = useState<Ledger[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserData, setCreateUserData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role: 'User',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ledgers');
  const [copyMessage, setCopyMessage] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateUserData({ ...createUserData, password });
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(createUserData.password);
      setCopyMessage('Password copied!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Copy failed');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  useEffect(() => {
    loadPendingLedgers();
    loadUsers();
  }, []);

  const loadPendingLedgers = async () => {
    try {
      const data = await ledgerService.getPendingLedgers();
      setPendingLedgers(data);
    } catch (err) {
      console.error('Failed to load pending ledgers');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await ledgerService.approveLedger(id);
      setMessage('Ledger approved successfully!');
      loadPendingLedgers();
      loadUsers();
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await userService.createUser(createUserData);
      setMessage('User created successfully!');
      setCreateUserData({ username: '', email: '', password: '', role: 'User' });
      setShowCreateUser(false);
      loadUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'User creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="content-area">
        <div className="container-fluid px-3 py-3">
          {activeTab === 'users' && (
            <div className="mb-4">
              <button
                className={`btn ${showCreateUser ? 'btn-secondary' : 'btn-glass'} rounded-pill px-4 py-2`}
                onClick={() => setShowCreateUser(!showCreateUser)}
              >
                {showCreateUser ? '❌ Cancel' : '➕ Create New User'}
              </button>
            </div>
          )}

          {/* Create User Modal */}
          {activeTab === 'users' && showCreateUser && (
            <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
              <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">👤 Create New User</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowCreateUser(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleCreateUser}>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold">Username</label>
                          <input
                            type="text"
                            className="form-control form-control-lg rounded-pill"
                            value={createUserData.username}
                            onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })}
                            placeholder="Enter username"
                            required
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold">Email</label>
                          <input
                            type="email"
                            className="form-control form-control-lg rounded-pill"
                            value={createUserData.email}
                            onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold">Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type="text"
                              className="form-control form-control-lg rounded-pill"
                              value={createUserData.password}
                              onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                              placeholder="Enter password or generate one"
                              required
                            />
                            <div className="password-actions">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm rounded-pill me-2"
                                onClick={generatePassword}
                              >
                                🎲 Generate
                              </button>
                              {createUserData.password && (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm rounded-pill"
                                  onClick={copyPassword}
                                >
                                  📋 Copy
                                </button>
                              )}
                            </div>
                          </div>
                          {copyMessage && (
                            <small className="text-success mt-1 d-block">{copyMessage}</small>
                          )}
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-semibold">Role</label>
                          <select
                            className="form-select form-select-lg rounded-pill"
                            value={createUserData.role}
                            onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}
                          >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn btn-secondary rounded-pill px-4"
                          onClick={() => setShowCreateUser(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg rounded-pill px-5" disabled={loading}>
                          {loading ? '⏳ Creating...' : '🚀 Create User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-pill`}>
              {message}
            </div>
          )}

          {activeTab === 'ledgers' && (
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
          )}

          {activeTab === 'users' && (
            <div className="table-glass">
              <div className="p-4 border-bottom">
                <h5 className="mb-0 fw-bold">👥 All Users</h5>
              </div>
              <div className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="fw-semibold py-3">Username</th>
                        <th className="fw-semibold py-3">Email</th>
                        <th className="fw-semibold py-3">Role</th>
                        <th className="fw-semibold py-3">Wallet Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="py-3 fw-semibold">{user.username}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">
                            <span className={`badge rounded-pill px-3 py-2 ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                              {user.role === 'Admin' ? '👑' : '👤'} {user.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="fw-bold text-success fs-5">${user.walletAmount.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;