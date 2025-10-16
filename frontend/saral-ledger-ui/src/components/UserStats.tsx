import type { User, Ledger } from '../types';

interface UserStatsProps {
  user: User;
  ledgers: Ledger[];
}

const UserStats = ({ user, ledgers }: UserStatsProps) => {
  const pendingAmount = ledgers.filter(l => l.status === 'Pending').reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="row mb-4">
      <div className="col-md-4 mb-3">
        <div className="stats-card p-4 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="text-muted mb-1">💰 Wallet Balance</h6>
              <h2 className="text-success mb-0 fw-bold">₹{user.walletAmount.toFixed(2)}</h2>
            </div>
            <div className="fs-1 opacity-25">💳</div>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-3">
        <div className="stats-card p-4 h-100">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="text-muted mb-1">⏳ Pending Amount</h6>
              <h2 className="text-warning mb-0 fw-bold">₹{pendingAmount.toFixed(2)}</h2>
            </div>
            <div className="fs-1 opacity-25">⏳</div>
          </div>
        </div>
      </div>
      <div className="col-md-4 mb-3">
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
  );
};

export default UserStats;