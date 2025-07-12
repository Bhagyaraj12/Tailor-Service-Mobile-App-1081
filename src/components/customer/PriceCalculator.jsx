import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import { calculatePrice, getEstimatedDeliveryDate } from '../../utils/priceCalculator';

const PriceCalculator = ({ category, design, addOns, onNext, onUpdateDeliveryDate }) => {
  const [deliveryDate, setDeliveryDate] = useState(getEstimatedDeliveryDate());

  const pricing = calculatePrice(category, design, addOns, deliveryDate);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setDeliveryDate(newDate);
    onUpdateDeliveryDate(newDate);
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Price & Delivery</h2>
          <p className="text-gray-600">Review pricing and select delivery date</p>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{category.name} - {design?.name}</span>
              <span>₹{pricing.basePrice + pricing.designPrice}</span>
            </div>

            {addOns.length > 0 && (
              <div className="space-y-1">
                {addOns.map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-500">+ {addon.name}</span>
                    <span>₹{addon.price}</span>
                  </div>
                ))}
              </div>
            )}

            {pricing.fastDeliveryCharge > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Fast Delivery Charge</span>
                <span>₹{pricing.fastDeliveryCharge}</span>
              </div>
            )}

            <hr className="my-2" />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-600">₹{pricing.total}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Date</h3>
          <input
            type="date"
            value={format(deliveryDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            min={minDate}
            max={maxDate}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Default delivery: {format(getEstimatedDeliveryDate(), 'MMM dd, yyyy')}
          </p>
          {pricing.fastDeliveryCharge > 0 && (
            <p className="text-sm text-orange-600 mt-1">
              Fast delivery charge applies for earlier dates
            </p>
          )}
        </Card>

        <div className="pt-4">
          <Button onClick={onNext} className="w-full">
            Proceed to Measurements
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceCalculator;