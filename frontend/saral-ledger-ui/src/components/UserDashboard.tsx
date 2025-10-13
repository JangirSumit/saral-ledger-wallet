import { useState, useEffect } from 'react';
import { ledgerService, userService } from '../services/api';
import { Ledger, User, LedgerUploadRequest } from '../types';

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>User Dashboard</h2>
        <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Profile</h3>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Wallet Amount:</strong> ${user.walletAmount.toFixed(2)}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {showUploadForm ? 'Cancel' : 'Upload Ledger'}
        </button>
      </div>

      {showUploadForm && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>Upload Ledger</h4>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '15px' }}>
              <label>Amount:</label>
              <input
                type="number"
                step="0.01"
                value={uploadData.amount}
                onChange={(e) => setUploadData({ ...uploadData, amount: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Description:</label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      {message && (
        <div style={{ padding: '10px', backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div>
        <h3>My Ledgers</h3>
        {ledgers.length === 0 ? (
          <p>No ledgers found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((ledger) => (
                <tr key={ledger.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>${ledger.amount.toFixed(2)}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ledger.description}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: ledger.status === 'Approved' ? '#d4edda' : ledger.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                      color: ledger.status === 'Approved' ? '#155724' : ledger.status === 'Rejected' ? '#721c24' : '#856404'
                    }}>
                      {ledger.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(ledger.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;