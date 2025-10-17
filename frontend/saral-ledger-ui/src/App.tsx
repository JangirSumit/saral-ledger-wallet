import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminLedgers from './components/AdminLedgers';
import AdminUsers from './components/AdminUsers';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChangePasswordModal from './components/ChangePasswordModal';
import MfaSetupModal from './components/MfaSetupModal';
import MfaDisableModal from './components/MfaDisableModal';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (_token: string, userData: User) => {
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="App">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onChangePassword={() => setShowChangePassword(true)}
        onMfaSetup={() => {
          if (user.mfaEnabled) {
            setShowMfaDisable(true);
          } else {
            setShowMfaSetup(true);
          }
        }}
      />
      <div className="content-area">
        <div className="container-fluid px-3 py-3">
          <Routes>
            <Route path="/" element={
              user.role === 'Admin' ? (
                <AdminLedgers user={user} />
              ) : (
                <UserDashboard user={user} />
              )
            } />
            <Route path="/ledgers" element={<AdminLedgers user={user} />} />
            <Route path="/users" element={<AdminUsers user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <Footer />
      
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {}}
      />
      
      <MfaSetupModal
        isOpen={showMfaSetup}
        onClose={() => setShowMfaSetup(false)}
        onSuccess={() => {
          if (user) {
            const updatedUser = { ...user, mfaEnabled: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }}
      />
      
      <MfaDisableModal
        isOpen={showMfaDisable}
        onClose={() => setShowMfaDisable(false)}
        onSuccess={() => {
          if (user) {
            const updatedUser = { ...user, mfaEnabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }}
      />
    </div>
  );
}

export default App;
