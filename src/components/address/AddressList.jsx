import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiBriefcase, FiMapPin, FiEdit2, FiTrash2, FiCheck } = FiIcons;

const AddressList = ({ addresses, onEdit, onDelete, onSelect, selectedId }) => {
  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return FiHome;
      case 'work':
        return FiBriefcase;
      default:
        return FiMapPin;
    }
  };

  const getAddressLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <motion.div
          key={address.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={`p-4 ${
              selectedId === address.id ? 'border-2 border-primary-600' : ''
            }`}
            onClick={() => onSelect && onSelect(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  selectedId === address.id ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <SafeIcon
                    icon={getAddressIcon(address.address_type)}
                    className={`w-5 h-5 ${
                      selectedId === address.id ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {getAddressLabel(address.address_type)}
                    </h3>
                    {address.is_default && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Default
                      </span>
                    )}
                    {selectedId === address.id && (
                      <SafeIcon
                        icon={FiCheck}
                        className="w-5 h-5 text-primary-600"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.phone_number}
                  </p>
                </div>
              </div>
              {onEdit && onDelete && (
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(address.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AddressList;