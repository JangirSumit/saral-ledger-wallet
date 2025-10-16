import { useState } from 'react';
import type { Ledger } from '../types';

interface LedgerTableProps {
  ledgers: Ledger[];
  onEdit?: (ledger: Ledger) => void;
  onDelete?: (ledger: Ledger) => void;
  onDownload?: (ledger: Ledger) => void;
  showActions?: boolean;
}

const LedgerTable = ({ ledgers, onEdit, onDelete, onDownload, showActions = false }: LedgerTableProps) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };
  return (
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
          <>
            {/* Desktop Table */}
            <div className="d-none d-md-block table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="fw-semibold py-2">Amount</th>
                    <th className="fw-semibold py-2">Description</th>
                    <th className="fw-semibold py-2">Status</th>
                    <th className="fw-semibold py-2">Date</th>
                    <th className="fw-semibold py-2">File</th>
                    {showActions && <th className="fw-semibold py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((ledger) => (
                    <tr key={ledger.id}>
                      <td className="py-2">
                        <span className="fw-bold text-success fs-5">₹{ledger.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-2">{ledger.description}</td>
                      <td className="py-2">
                        <span className={`badge rounded-pill px-2 py-1 ${
                          ledger.status === 'Approved' ? 'bg-success' : 
                          ledger.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}>
                          {ledger.status === 'Approved' ? '✅' : ledger.status === 'Rejected' ? '❌' : '⏳'} {ledger.status === 'Pending' ? 'Pending for Approval' : ledger.status}
                        </span>
                      </td>
                      <td className="py-2 text-muted">{new Date(ledger.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        {ledger.fileName ? (
                          <button
                            className="btn btn-outline-info btn-sm rounded-pill px-3"
                            onClick={() => onDownload?.(ledger)}
                          >
                            📎 Download
                          </button>
                        ) : (
                          <span className="text-muted small">No file</span>
                        )}
                      </td>
                      {showActions && (
                        <td className="py-2">
                          {ledger.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm rounded-pill me-2 px-3"
                                onClick={() => onEdit?.(ledger)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                onClick={() => onDelete?.(ledger)}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="d-md-none">
              {ledgers.map((ledger) => (
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
                    <div className="text-muted small mt-1">{new Date(ledger.createdAt).toLocaleDateString()}</div>
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
                            onClick={() => onDownload?.(ledger)}
                          >
                            📎 Download
                          </button>
                        )}
                        
                        {showActions && ledger.status === 'Pending' && (
                          <>
                            <button
                              className="btn btn-outline-primary btn-sm rounded-pill"
                              onClick={() => onEdit?.(ledger)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill"
                              onClick={() => onDelete?.(ledger)}
                            >
                              🗑️ Delete
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
  );
};

export default LedgerTable;