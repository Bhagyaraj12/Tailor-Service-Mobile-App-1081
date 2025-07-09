import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/DummyAuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLogOut, FiUser, FiMenu } = FiIcons;

const Header = ({ title, showBack = false, onBack, actions }) => {
  const { user, userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <SafeIcon icon={FiIcons.FiArrowLeft} className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {user && (
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">DEMO</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {actions}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user.phoneNumber || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <SafeIcon icon={FiLogOut} className="w-5 h-5 text-red-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;