import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { User, CreateUserRequest } from '../types';
import ResetPasswordModal from './ResetPasswordModal';
import { handleSort, filterAndSortUsers, getSortIcon } from '../utils/tableUtils';

interface AdminUsersProps {
  user: User;
}

interface UserCardProps {
  user: User;
  onResetPassword: (user: { id: number; username: string }) => void;
}

const UserCard = ({ user, onResetPassword }: UserCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ledger-card">
      <div className="ledger-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">#{user.id} - {user.username}</div>
            <div className="text-muted small">{user.email}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge rounded-pill ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
              {user.role}
            </span>
            <span className="expand-icon" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="ledger-card-body">
          <div className="row g-2">
            <div className="col-6">
              <small className="text-muted">Wallet Amount</small>
              <div className="fw-bold text-success">₹{user.walletAmount.toFixed(2)}</div>
            </div>
            <div className="col-6">
              <small className="text-muted">Actions</small>
              <div>
                <button
                  className="btn btn-outline-warning btn-sm rounded-pill"
                  onClick={() => onResetPassword({ id: user.id, username: user.username })}
                >
                  🔑 Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminUsers = ({ }: AdminUsersProps) => {
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
  const [copyMessage, setCopyMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [resetPasswordUser, setResetPasswordUser] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

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

  const handleSortClick = (field: string) => {
    const sortConfig = handleSort(sortField, sortDirection, field);
    setSortField(sortConfig.field);
    setSortDirection(sortConfig.direction);
  };

  const filteredAndSortedUsers = filterAndSortUsers(users, filter, sortField, sortDirection);

  return (
    <>
      <div className="mb-4">
        <button
          className="btn btn-glass rounded-pill px-4 py-2"
          onClick={() => setShowCreateUser(true)}
        >
          ➕ Create New User
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">👤 Create New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateUser(false)}>✕</button>
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
                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowCreateUser(false)}>
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

      <div className="table-glass">
        <div className="p-4 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">👥 All Users</h5>
            <input
              type="text"
              className="form-control rounded-pill"
              style={{ maxWidth: '300px' }}
              placeholder="Search by ID, username, email, role..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="p-0">
          {/* Desktop Table */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSortClick('id')}>
                    ID{getSortIcon(sortField, 'id', sortDirection)}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSortClick('username')}>
                    Username{getSortIcon(sortField, 'username', sortDirection)}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSortClick('email')}>
                    Email{getSortIcon(sortField, 'email', sortDirection)}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSortClick('role')}>
                    Role{getSortIcon(sortField, 'role', sortDirection)}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSortClick('walletAmount')}>
                    Wallet{getSortIcon(sortField, 'walletAmount', sortDirection)}
                  </th>
                  <th className="fw-semibold py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 text-muted small">#{u.id}</td>
                    <td className="py-2 fw-semibold">{u.username}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <span className={`badge rounded-pill ${u.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="fw-bold text-success">₹{u.walletAmount.toFixed(2)}</span>
                    </td>
                    <td className="py-2">
                      <button
                        className="btn btn-outline-warning btn-sm rounded-pill"
                        onClick={() => setResetPasswordUser({ id: u.id, username: u.username })}
                        title="Reset Password"
                      >
                        🔑 Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="d-md-none">
            {filteredAndSortedUsers.map((u) => (
              <UserCard key={u.id} user={u} onResetPassword={setResetPasswordUser} />
            ))}
          </div>
        </div>
      </div>

      {resetPasswordUser && (
        <ResetPasswordModal
          isOpen={true}
          onClose={() => setResetPasswordUser(null)}
          userId={resetPasswordUser.id}
          username={resetPasswordUser.username}
          onSuccess={() => {
            setMessage('Password reset successfully!');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}
    </>
  );
};

export default AdminUsers;