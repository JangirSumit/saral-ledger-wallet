import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { User, CreateUserRequest } from '../types';

interface AdminUsersProps {
  user: User;
}

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.id.toString().includes(filter) ||
      user.username.toLowerCase().includes(filter.toLowerCase()) ||
      (user.email?.toLowerCase().includes(filter.toLowerCase()) || false) ||
      user.role.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

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
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSort('id')}>
                    ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSort('username')}>
                    Username {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSort('email')}>
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSort('role')}>
                    Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="fw-semibold py-2 cursor-pointer" onClick={() => handleSort('walletAmount')}>
                    Wallet {sortField === 'walletAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;