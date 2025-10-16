import type { Ledger } from '../types';

interface LedgerTableProps {
  ledgers: Ledger[];
  onEdit?: (ledger: Ledger) => void;
  onDelete?: (ledger: Ledger) => void;
  showActions?: boolean;
}

const LedgerTable = ({ ledgers, onEdit, onDelete, showActions = false }: LedgerTableProps) => {
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
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold py-2">Amount</th>
                  <th className="fw-semibold py-2">Description</th>
                  <th className="fw-semibold py-2">Status</th>
                  <th className="fw-semibold py-2">Date</th>
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
        )}
      </div>
    </div>
  );
};

export default LedgerTable;