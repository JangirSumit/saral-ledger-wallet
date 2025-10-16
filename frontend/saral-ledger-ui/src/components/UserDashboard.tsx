import { useState, useEffect } from 'react';
import { ledgerService, userService } from '../services/api';
import type { Ledger, User, LedgerUploadRequest } from '../types';
import UserStats from './UserStats';
import LedgerUploadModal from './LedgerUploadModal';
import LedgerTable from './LedgerTable';
import ConfirmDialog from './ConfirmDialog';

interface UserDashboardProps {
  user: User;
}

const UserDashboard = ({ user: initialUser }: UserDashboardProps) => {
  const [user, setUser] = useState<User>(initialUser);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ledgerToDelete, setLedgerToDelete] = useState<Ledger | null>(null);
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

  const handleUpload = async (uploadData: LedgerUploadRequest) => {
    setLoading(true);
    setMessage('');

    try {
      if (editingLedger) {
        await ledgerService.updateLedger(editingLedger.id, uploadData);
        setMessage('Ledger updated successfully!');
        setEditingLedger(null);
      } else {
        await ledgerService.uploadLedger(uploadData);
        setMessage('Ledger uploaded successfully! Waiting for admin approval.');
      }
      setShowUploadForm(false);
      loadLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ledger: Ledger) => {
    setEditingLedger(ledger);
    setShowUploadForm(true);
  };

  const handleDelete = (ledger: Ledger) => {
    setLedgerToDelete(ledger);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!ledgerToDelete) return;
    
    setLoading(true);
    try {
      await ledgerService.deleteLedger(ledgerToDelete.id);
      setMessage('Ledger deleted successfully!');
      loadLedgers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setLedgerToDelete(null);
    }
  };

  const handleDownload = async (ledger: Ledger) => {
    try {
      const blob = await ledgerService.downloadFile(ledger.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ledger.fileName || `ledger-${ledger.id}-file`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setMessage('File download failed');
    }
  };

  return (
    <>
      {user.role === 'User' && <UserStats user={user} ledgers={ledgers} />}

      {user.role === 'User' && (
        <div className="mb-4">
          <button
            className="btn btn-glass rounded-pill px-4 py-2"
            onClick={() => setShowUploadForm(true)}
          >
            ➕ Upload New Ledger
          </button>
        </div>
      )}

      <LedgerUploadModal
        show={showUploadForm}
        onClose={() => {
          setShowUploadForm(false);
          setEditingLedger(null);
        }}
        onSubmit={handleUpload}
        loading={loading}
        editData={editingLedger}
      />

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} rounded-pill`}>
          {message}
        </div>
      )}

      <LedgerTable 
        ledgers={ledgers} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        showActions={true}
      />

      <ConfirmDialog
        show={showDeleteConfirm}
        title="Delete Ledger"
        message={`Are you sure you want to delete this ledger of ₹${ledgerToDelete?.amount.toFixed(2)}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setLedgerToDelete(null);
        }}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
};

export default UserDashboard;