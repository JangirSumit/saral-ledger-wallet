import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onChangePassword: () => void;
}

const Navbar = ({ user, onLogout, onChangePassword }: NavbarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = () => {
    if (location.pathname === '/users') return 'users';
    if (location.pathname === '/ledgers') return 'ledgers';
    return 'home';
  };
  
  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
      setShowMobileMenu(false);
    };
    if (showDropdown || showMobileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown, showMobileMenu]);

  return (
    <nav className="navbar navbar-light navbar-custom">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <span className="navbar-brand-custom mb-0">
            <img src="/icon_192.png" alt="SaralPay" style={{width: '32px', height: '32px', marginRight: '8px'}} />
            SaralPay
          </span>
          <span className={`badge rounded-pill ms-3 ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
            {user.role}
          </span>
        </div>
        
        <div className="d-flex align-items-center">
          {/* Desktop Menu */}
          {user.role === 'Admin' && (
            <div className="d-none d-md-flex me-4">
              <button
                className={`tab-button ${getActiveTab() === 'ledgers' ? 'active' : ''}`}
                onClick={() => handleTabChange('ledgers')}
              >
                📊 Ledgers
              </button>
              <button
                className={`tab-button ${getActiveTab() === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                👥 Users
              </button>
            </div>
          )}
          
          {/* Mobile Burger Menu */}
          {user.role === 'Admin' && (
            <button
              className="btn d-md-none me-3 burger-menu"
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
            >
              ☰
            </button>
          )}
          
          <div className="position-relative">
            <button
              className="btn btn-outline-primary rounded-pill px-3"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              👤 {user.username}
            </button>
            {showDropdown && (
              <div className="user-dropdown position-absolute end-0 mt-2 p-3" style={{minWidth: '250px', zIndex: 1050}}>
                <div className="text-center mb-3">
                  <div className="fw-bold fs-5">{user.username}</div>
                  <div className="text-muted small">{user.email}</div>
                  {user.role === 'User' && (
                    <div className="text-success fw-bold fs-4 mt-2">💰 ₹{user.walletAmount.toFixed(2)}</div>
                  )}
                </div>
                <hr />
                <button 
                  className="btn btn-outline-primary w-100 rounded-pill mb-2" 
                  onClick={() => {
                    onChangePassword();
                    setShowDropdown(false);
                  }}
                >
                  🔐 Change Password
                </button>
                <button className="btn btn-danger w-100 rounded-pill" onClick={onLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && user.role === 'Admin' && (
          <div className="mobile-menu position-absolute w-100 start-0 mt-2" style={{top: '100%', zIndex: 1040}}>
            <div className="mobile-menu-content p-3">
              <button
                className={`mobile-tab-button w-100 mb-2 ${getActiveTab() === 'ledgers' ? 'active' : ''}`}
                onClick={() => handleTabChange('ledgers')}
              >
                📊 Ledgers
              </button>
              <button
                className={`mobile-tab-button w-100 ${getActiveTab() === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                👥 Users
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;