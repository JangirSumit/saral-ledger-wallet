import { useState, useEffect } from 'react';
import { ledgerService, userService } from '../services/api';
import { Ledger, User, CreateUserRequest } from '../types';

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
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowCreateUser(!showCreateUser)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {showCreateUser ? 'Cancel' : 'Create New User'}
        </button>
      </div>

      {showCreateUser && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>Create New User</h4>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '15px' }}>
              <label>Username:</label>
              <input
                type="text"
                value={createUserData.username}
                onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Email:</label>
              <input
                type="email"
                value={createUserData.email}
                onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Password:</label>
              <input
                type="password"
                value={createUserData.password}
                onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Role:</label>
              <select
                value={createUserData.role}
                onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {message && (
        <div style={{ padding: '10px', backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3>Pending Ledgers</h3>
        {pendingLedgers.length === 0 ? (
          <p>No pending ledgers.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>User</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Created</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLedgers.map((ledger) => (
                <tr key={ledger.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ledger.user?.username}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>${ledger.amount.toFixed(2)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ledger.description}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(ledger.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleApprove(ledger.id)}
                      style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '5px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(ledger.id)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3>All Users</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Username</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Wallet Amount</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.username}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.role}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>${user.walletAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;