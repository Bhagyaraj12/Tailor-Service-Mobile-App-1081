import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import AddressManager from '../address/AddressManager';

const DeliveryAddressStep = ({ onNext, onAddressSelect }) => {
  const [pickupAddress, setPickupAddress] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [step, setStep] = useState('pickup'); // 'pickup' or 'delivery'

  const handleNext = () => {
    onAddressSelect({
      pickupAddress,
      deliveryAddress
    });
    onNext();
  };

  const renderStep = () => {
    if (step === 'pickup') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Pickup Address
            </h2>
            <p className="text-gray-600">
              Choose where we should pick up the fabric
            </p>
          </div>
          
          <AddressManager
            mode="select"
            selectedAddressId={pickupAddress?.id}
            onSelectAddress={(address) => {
              setPickupAddress(address);
              setStep('delivery');
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select Delivery Address
          </h2>
          <p className="text-gray-600">
            Choose where we should deliver your finished garment
          </p>
        </div>

        {pickupAddress && (
          <Card className="p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700">Pickup Address</p>
            <p className="text-sm text-gray-600">
              {pickupAddress.full_name}
              <br />
              {pickupAddress.address_line1}
              {pickupAddress.address_line2 && `, ${pickupAddress.address_line2}`}
              <br />
              {pickupAddress.city}, {pickupAddress.state} - {pickupAddress.pincode}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep('pickup')}
              className="mt-2"
            >
              Change
            </Button>
          </Card>
        )}
        
        <AddressManager
          mode="select"
          selectedAddressId={deliveryAddress?.id}
          onSelectAddress={setDeliveryAddress}
        />

        {deliveryAddress && (
          <Button
            onClick={handleNext}
            className="w-full mt-4"
          >
            Continue
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {renderStep()}
      </motion.div>
    </div>
  );
};

export default DeliveryAddressStep;