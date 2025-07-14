import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTruck, FiMapPin, FiCheck } = FiIcons;

const OrderDeliveryModal = ({ job, onClose, onUpdateDelivery, addresses }) => {
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleDelivery = async (status) => {
    try {
      setUpdating(true);
      await onUpdateDelivery(job.id, status, deliveryNotes);
      onClose();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const getAddressById = (addressId) => {
    return addresses.find(addr => addr.id === addressId) || {};
  };

  const pickupAddress = getAddressById(job.pickup_address_id);
  const deliveryAddress = getAddressById(job.delivery_address_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delivery Management
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                Pickup Address
              </h4>
              <p className="text-sm text-gray-600">
                {pickupAddress.full_name || 'N/A'}
                <br />
                {pickupAddress.address_line1 || 'No address available'}
                {pickupAddress.address_line2 && `, ${pickupAddress.address_line2}`}
                <br />
                {pickupAddress.city && `${pickupAddress.city}, ${pickupAddress.state} - ${pickupAddress.pincode}`}
                <br />
                {pickupAddress.phone_number}
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                Delivery Address
              </h4>
              <p className="text-sm text-gray-600">
                {deliveryAddress.full_name || 'N/A'}
                <br />
                {deliveryAddress.address_line1 || 'No address available'}
                {deliveryAddress.address_line2 && `, ${deliveryAddress.address_line2}`}
                <br />
                {deliveryAddress.city && `${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`}
                <br />
                {deliveryAddress.phone_number}
              </p>
            </Card>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Add any special instructions or notes for delivery"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleDelivery('out_for_delivery')}
              loading={updating}
              className="flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiTruck} className="w-5 h-5" />
              <span>Out for Delivery</span>
            </Button>

            <Button
              onClick={() => handleDelivery('delivered')}
              loading={updating}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <SafeIcon icon={FiCheck} className="w-5 h-5" />
              <span>Mark as Delivered</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDeliveryModal;