import { useState, useEffect } from 'react';
import type { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar = ({ user, onLogout, activeTab, onTabChange }: NavbarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <span className="navbar-brand-custom mb-0">💰 Saral Ledger</span>
          <span className={`badge rounded-pill ms-3 ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
            {user.role}
          </span>
        </div>
        
        <div className="d-flex align-items-center">
          {/* Desktop Menu */}
          <div className="d-none d-md-flex me-4">
            <button
              className={`tab-button ${activeTab === 'ledgers' ? 'active' : ''}`}
              onClick={() => onTabChange('ledgers')}
            >
              📊 Ledgers
            </button>
            {user.role === 'Admin' && (
              <button
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => onTabChange('users')}
              >
                👥 Users
              </button>
            )}
          </div>
          
          {/* Mobile Burger Menu */}
          <button
            className="btn d-md-none me-3 burger-menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileMenu(!showMobileMenu);
            }}
          >
            ☰
          </button>
          
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
                    <div className="text-success fw-bold fs-4 mt-2">💰 ${user.walletAmount.toFixed(2)}</div>
                  )}
                </div>
                <hr />
                <button className="btn btn-danger w-100 rounded-pill" onClick={onLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="mobile-menu position-absolute w-100 start-0 mt-2" style={{top: '100%', zIndex: 1040}}>
            <div className="mobile-menu-content p-3">
              <button
                className={`mobile-tab-button w-100 mb-2 ${activeTab === 'ledgers' ? 'active' : ''}`}
                onClick={() => {
                  onTabChange('ledgers');
                  setShowMobileMenu(false);
                }}
              >
                📊 Ledgers
              </button>
              {user.role === 'Admin' && (
                <button
                  className={`mobile-tab-button w-100 ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('users');
                    setShowMobileMenu(false);
                  }}
                >
                  👥 Users
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;