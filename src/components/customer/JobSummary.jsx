import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { calculatePrice } from '../../utils/priceCalculator';

const JobSummary = ({
  category,
  design,
  addOns,
  deliveryDate,
  measurementData,
  pickupAddress,
  deliveryAddress,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pricing = calculatePrice(category, design, addOns, deliveryDate);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Submitting job with data:', {
        category,
        design,
        addOns,
        deliveryDate,
        measurementData,
        pickupAddress,
        deliveryAddress,
        pricing
      });
      
      // Make sure we have addresses
      if (!pickupAddress || !pickupAddress.id) {
        throw new Error('Please select a pickup address');
      }
      
      if (!deliveryAddress || !deliveryAddress.id) {
        throw new Error('Please select a delivery address');
      }
      
      await onSubmit();
      console.log('Job submitted successfully');
    } catch (error) {
      console.error('Error submitting job:', error);
      setError(error.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Submitting your order..." />;
  }

  return (
    <div className="p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
          <p className="text-gray-600">Review your order before submitting</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Garment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Category</span>
              <span className="font-medium">{category?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Design</span>
              <span className="font-medium">{design?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Date</span>
              <span className="font-medium">{format(deliveryDate, 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </Card>

        {addOns && addOns.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Add-ons</h3>
            <div className="space-y-1">
              {addOns.map(addon => (
                <div key={addon.id} className="flex justify-between">
                  <span className="text-gray-600">{addon.name}</span>
                  <span>₹{addon.price}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Measurements</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Method</span>
              <span className="font-medium capitalize">
                {measurementData?.method === 'sample' ? 'Sample Image' : 'Custom Measurements'}
              </span>
            </div>
            {measurementData?.method === 'sample' && measurementData?.sampleImage && (
              <div className="mt-2">
                <img src={measurementData.sampleImage} alt="Sample" className="w-24 h-24 object-cover rounded-lg" />
              </div>
            )}
            {measurementData?.method === 'custom' && measurementData?.measurements && (
              <div className="mt-2 text-sm text-gray-600">
                {Object.entries(measurementData.measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('-', ' ')}</span>
                    <span>{value}"</span>
                  </div>
                ))}
              </div>
            )}
            {measurementData?.schedulePickup && (
              <div className="text-sm text-primary-600">
                ✓ Fabric pickup scheduled
              </div>
            )}
          </div>
        </Card>

        {/* Address Information */}
        <div className="grid grid-cols-1 gap-4">
          {pickupAddress && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Pickup Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{pickupAddress.full_name}</p>
                <p>{pickupAddress.address_line1}</p>
                {pickupAddress.address_line2 && <p>{pickupAddress.address_line2}</p>}
                <p>{pickupAddress.city}, {pickupAddress.state} - {pickupAddress.pincode}</p>
                <p>{pickupAddress.phone_number}</p>
              </div>
            </Card>
          )}

          {deliveryAddress && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{deliveryAddress.full_name}</p>
                <p>{deliveryAddress.address_line1}</p>
                {deliveryAddress.address_line2 && <p>{deliveryAddress.address_line2}</p>}
                <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                <p>{deliveryAddress.phone_number}</p>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-4 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price</span>
              <span>₹{pricing.basePrice + pricing.designPrice}</span>
            </div>
            {pricing.addOnsPrice > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Add-ons</span>
                <span>₹{pricing.addOnsPrice}</span>
              </div>
            )}
            {pricing.fastDeliveryCharge > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Fast Delivery</span>
                <span>₹{pricing.fastDeliveryCharge}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary-600">₹{pricing.total}</span>
            </div>
          </div>
        </Card>

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !pickupAddress || !deliveryAddress}
            className="w-full"
          >
            {loading ? 'Submitting Order...' : 'Submit Order'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default JobSummary;