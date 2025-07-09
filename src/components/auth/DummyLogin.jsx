import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPhone, FiUser } = FiIcons;

const DummyLogin = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create dummy user data
    const dummyUser = {
      uid: `dummy_${selectedRole}_${Date.now()}`,
      phoneNumber: phoneNumber || `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      role: selectedRole
    };
    
    onLogin(dummyUser);
    setLoading(false);
  };

  const quickLoginOptions = [
    { role: 'customer', phone: '+91 98765 43210', label: 'Customer Demo' },
    { role: 'admin', phone: '+91 98765 43211', label: 'Admin Demo' },
    { role: 'tailor', phone: '+91 98765 43212', label: 'Tailor Demo' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <span className="text-3xl text-white">✂️</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TailorCraft</h1>
          <p className="text-gray-600">Professional tailoring services</p>
          <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
            DEMO MODE
          </div>
        </div>

        <Card className="p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Demo Login</h3>
          <div className="space-y-2">
            {quickLoginOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => {
                  setSelectedRole(option.role);
                  setPhoneNumber(option.phone);
                  const dummyUser = {
                    uid: `dummy_${option.role}_${Date.now()}`,
                    phoneNumber: option.phone,
                    role: option.role
                  };
                  onLogin(dummyUser);
                }}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.phone}</div>
                  </div>
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['customer', 'admin', 'tailor'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-lg border-2 transition-all capitalize ${
                      selectedRole === role
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <SafeIcon icon={FiPhone} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for random number
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Login as {selectedRole}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-4 text-xs text-gray-500">
          This is a demo version. No real authentication required.
        </div>
      </motion.div>
    </div>
  );
};

export default DummyLogin;