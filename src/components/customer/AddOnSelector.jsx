import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { addOns } from '../../data/garmentData';

const AddOnSelector = ({ onSelectAddOns, onNext }) => {
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const toggleAddOn = (addon) => {
    const isSelected = selectedAddOns.find(item => item.id === addon.id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedAddOns.filter(item => item.id !== addon.id);
    } else {
      newSelection = [...selectedAddOns, addon];
    }
    
    setSelectedAddOns(newSelection);
    onSelectAddOns(newSelection);
  };

  const totalAddOnPrice = selectedAddOns.reduce((total, addon) => total + addon.price, 0);

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add-On Services</h2>
          <p className="text-gray-600">Enhance your garment with premium add-ons</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {addOns.map((addon) => {
            const isSelected = selectedAddOns.find(item => item.id === addon.id);
            
            return (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => toggleAddOn(addon)}
                  className={`p-4 border-2 transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                      <p className="text-sm text-gray-600">+₹{addon.price}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {selectedAddOns.length > 0 && (
          <Card className="p-4 bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                {selectedAddOns.length} Add-on{selectedAddOns.length > 1 ? 's' : ''} Selected
              </span>
              <span className="font-bold text-primary-600">
                +₹{totalAddOnPrice}
              </span>
            </div>
          </Card>
        )}

        <div className="pt-4">
          <Button onClick={onNext} className="w-full">
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddOnSelector;